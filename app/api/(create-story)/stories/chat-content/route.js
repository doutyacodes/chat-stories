import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from '../../../../../utils';
import { CHARACTERS, CHAT_MESSAGES, EPISODE_DETAILS } from '../../../../../utils/schema';
import { authenticate } from '../../../../../lib/jwtMiddleware';
import Client from 'ssh2-sftp-client';
import path from 'path';
import fs from 'fs';
import os from 'os';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

// Constants for file upload
const CPANEL_CONFIG = {
  host: '68.178.163.247',
  port: 22,
  username: 'devusr',
  password: 'Wowfyuser#123'
};
const CPANEL_DIRECTORY = '/home/devusr/public_html/testusr/images';
const LOCAL_TEMP_DIR = path.join(os.tmpdir(), 'story-uploads');

// Lazy load pdf-parse only when needed
async function getPDFParser() {
  const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
  return pdfParse;
}

// Function to handle file upload to cPanel
async function uploadFileToCPanel(file, fileName) {
  const sftp = new Client();
  try {
    await sftp.connect(CPANEL_CONFIG);

    // Ensure local temp directory exists
    if (!fs.existsSync(LOCAL_TEMP_DIR)) {
      fs.mkdirSync(LOCAL_TEMP_DIR, { recursive: true });
    }

    const localFilePath = path.join(LOCAL_TEMP_DIR, fileName);

    // Convert File object to buffer and save locally
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(localFilePath, buffer);

    // Upload to cPanel
    await sftp.put(localFilePath, `${CPANEL_DIRECTORY}/${fileName}`);

    // Clean up local file
    fs.unlinkSync(localFilePath);

    return fileName;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  } finally {
    await sftp.end();
  }
}

// Helper function to process PDF content (remains the same)
async function processPDFContent(buffer, characterMap) {
  try {
    const parsePDF = await getPDFParser();
    const pdfData = await parsePDF(buffer);
    
    if (!pdfData || !pdfData.text) {
      throw new Error('Failed to parse PDF content');
    }

    return pdfData.text
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return null;
        
        const characterName = line.substring(0, colonIndex).trim();
        const message = line.substring(colonIndex + 1).trim();
        
        const characterId = characterMap.get(characterName.toLowerCase());
        if (!characterId) return null;

        return {
          characterId,
          message
        };
      })
      .filter(line => line !== null);
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF content');
  }
}

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const formData = await request.formData();
    const storyId = formData.get('storyId');
    const selectedEpisode = formData.get('selectedEpisode');
    const inputType = formData.get('inputType');

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Fetch characters (remains the same)
    const characters = await db
      .select({
        id: CHARACTERS.id,
        name: CHARACTERS.name
      })
      .from(CHARACTERS)
      .where(eq(CHARACTERS.story_id, storyId));

    if (!characters.length) {
      return NextResponse.json(
        { error: 'No characters found for this story' },
        { status: 400 }
      );
    }

    const characterMap = new Map(
      characters.map(char => [char.name.toLowerCase(), char.id])
    );

    // Handle chat messages
    let linesToInsert = [];

    if (inputType === 'manual') {
      const storyLines = JSON.parse(formData.get('storyLines'));
      
      if (!Array.isArray(storyLines)) {
        return NextResponse.json(
          { error: 'Invalid story lines format' },
          { status: 400 }
        );
      }

      linesToInsert = storyLines.map(line => ({
        characterId: line.character,
        message: line.line
      }));
    } else {
      // Handle PDF upload (remains the same)
      const pdfFile = formData.get('pdfFile');
      if (!pdfFile || !(pdfFile instanceof Blob)) {
        return NextResponse.json(
          { error: 'Valid PDF file is required' },
          { status: 400 }
        );
      }

      if (!pdfFile.type || !pdfFile.type.includes('pdf')) {
        return NextResponse.json(
          { error: 'File must be a PDF' },
          { status: 400 }
        );
      }

      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        linesToInsert = await processPDFContent(buffer, characterMap);

        if (!linesToInsert.length) {
          return NextResponse.json(
            { error: 'No valid dialogue lines found in PDF' },
            { status: 400 }
          );
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { error: 'Failed to parse PDF file' },
          { status: 400 }
        );
      }
    }

    // Begin transaction for database operations
    await db.transaction(async (tx) => {
      // Insert chat messages
      const messagePromises = linesToInsert.map((line, index) => 
        tx.insert(CHAT_MESSAGES).values({
          story_id: storyId,
          episode_id: selectedEpisode || null,
          character_id: line.characterId,
          message: line.message,
          sequence: index + 1
        })
      );

      await Promise.all(messagePromises);

      // Handle episode details if provided
      const episodeDetailsRaw = formData.get('episodeDetails');
      console.log("episode detals", episodeDetailsRaw)
      if (episodeDetailsRaw && selectedEpisode) {
        console.log("logg 1");
        
        const episodeDetails = JSON.parse(episodeDetailsRaw);
        
        // Process each episode detail
        for (let i = 0; i < episodeDetails.length; i++) {
          const detail = episodeDetails[i];
          const mediaFile = formData.get(`mediaFile${i}`);
          
          if (mediaFile && detail.description) {
            console.log("logg 2");

            // Generate unique filename
            const fileExtension = mediaFile.name.split('.').pop();
            const fileName = `episode_${selectedEpisode}_${Date.now()}_${i}.${fileExtension}`;
            
            // Upload file to cPanel
            const mediaUrl = await uploadFileToCPanel(mediaFile, fileName);
            
            // Insert episode detail record
            await tx.insert(EPISODE_DETAILS).values({
              episode_id: selectedEpisode,
              media_type: detail.mediaType,
              media_url: mediaUrl,
              description: detail.description,
              order: detail.order,
              position: detail.position || 'before' // Add position with default fallback
            });
          }
          console.log("logg 3");
        }
      }
    });

    return NextResponse.json(
      { message: 'Story content saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving story content:', error);
    return NextResponse.json(
      { error: 'Failed to save story content' },
      { status: 500 }
    );
  }
}