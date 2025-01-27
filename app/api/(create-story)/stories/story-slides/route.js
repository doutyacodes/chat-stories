import { NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import Client from 'ssh2-sftp-client';
import { db } from '@/utils';
import { STORIES, CHARACTERS, EPISODES, SLIDES, SLIDE_CONTENT, CHAT_MESSAGES } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, desc } from 'drizzle-orm';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

// Lazy load pdf-parse only when needed
async function getPDFParser() {
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
    return pdfParse;
}

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const formData = await request.formData();
    
    // Parse data from formData
    const storyId = parseInt(formData.get('storyId'));
    const name = formData.get('name');
    const synopsis = formData.get('synopsis');
    const slides = JSON.parse(formData.get('slides') || '[]');

    // Fetch the latest episode number
    const lastEpisode = await db
      .select({ episode_number: EPISODES.episode_number })
      .from(EPISODES)
      .where(eq(EPISODES.story_id, storyId))
      .orderBy(desc(EPISODES.episode_number))
      .limit(1);

    const nextEpisodeNumber = (lastEpisode[0]?.episode_number || 0) + 1;

    // Create episode
    const episodeResult = await db.insert(EPISODES).values({
      story_id: storyId,
      name,
      synopsis,
      episode_number: nextEpisodeNumber
    });

    const episodeId = episodeResult[0].insertId;

    // Process slides
    for (let [position, slide] of slides.entries()) {
      // Insert slide
      const slideResult = await db.insert(SLIDES).values({
        story_id: storyId,
        episode_id: episodeId,
        slide_type: slide.type,
        position
      });
      const slideId = slideResult[0].insertId;

      // Handle slide content based on type
      if (slide.type === 'image') {
        const imageFile = formData.get(`slides[${position}].file`);
        let mediaUrl = null;

        if (imageFile) {
          mediaUrl = await uploadImage(imageFile);
        }

        await db.insert(SLIDE_CONTENT).values({
          slide_id: slideId,
          media_type: 'image',
          media_url: mediaUrl,
          description: slide.content.description || ''
        });
      } else if (slide.type === 'chat') {
        // Process characters
        const characters = JSON.parse(formData.get('characters') || '[]');
        const characterIds = await processCharacters(storyId, characters);

        // Handle different input types
        if (slide.content.inputType === 'manual') {
          for (let [sequence, line] of slide.content.storyLines.entries()) {
            const characterId = characterIds.find(c => c.name === line.character)?.id;
            
            if (characterId) {
              await db.insert(CHAT_MESSAGES).values({
                story_id: storyId,
                episode_id: episodeId,
                character_id: characterId,
                message: line.line,
                sequence
              });
            }
          }
        } else if (slide.content.inputType === 'pdf') {
          const pdfFile = formData.get(`slides[${position}].pdfFile`);
          
          if (pdfFile) {
            const pdfContent = await processPDFContent(
              pdfFile, 
              new Map(characterIds.map(c => [c.name.toLowerCase(), c.id]))
            );

            for (let [sequence, { characterId, message }] of pdfContent.entries()) {
              await db.insert(CHAT_MESSAGES).values({
                story_id: storyId,
                episode_id: episodeId,
                character_id: characterId,
                message,
                sequence
              });
            }
          }
        }
      }
    }

    // Process slides
    // for (let [position, slide] of slides.entries()) {
    //     if (slide.type === 'image') {
    //         // Look for file using the specific key
    //         const imageFile = formData.get(`slides[${position}].file`);
    //         if (imageFile) {
    //         const mediaUrl = await uploadImage(imageFile);
    //         // Rest of image processing remains the same
    //         }
    //     } else if (slide.type === 'chat' && slide.content.inputType === 'pdf') {
    //       const pdfFile = formData.get(`slides[${position}].pdfFile`);
          
    //       if (pdfFile) {
    //         // Process characters first
    //         const characters = JSON.parse(formData.get('characters') || '[]');
    //         const characterIds = await processCharacters(storyId, characters);
            
    //         const pdfContent = await processPDFContent(
    //           pdfFile, 
    //           new Map(characterIds.map(c => [c.name.toLowerCase(), c.id]))
    //         );

    //         // Insert PDF chat messages
    //         for (let [sequence, { characterId, message }] of pdfContent.entries()) {
    //           await db.insert(CHAT_MESSAGES).values({
    //             story_id: storyId,
    //             episode_id: episodeId,
    //             character_id: characterId,
    //             message,
    //             sequence
    //           });
    //         }
    //       }
    //     }
    // }

    return NextResponse.json({ 
      message: 'Episode created successfully', 
      episodeId 
    }, { status: 200 });

  } catch (error) {
    console.error('Error creating episode:', error);
    return NextResponse.json(
      { error: 'Failed to create episode', details: error.message },
      { status: 500 }
    );
  }
}

// Helper functions (uploadImage, processPDFContent, processCharacters)
// Implement these as in the previous example, adjusting for File handling
async function uploadImage(file) {
  const sftp = new Client();
  const fileName = `${Date.now()}-${file.name}`;

  try {
    await sftp.connect({
      host: '68.178.163.247',
      port: 22,
      username: 'devusr',
      password: 'Wowfyuser#123',
    });

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const localFilePath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(localFilePath, buffer);

    const cPanelDirectory = '/home/devusr/public_html/testusr/images';
    await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

    return `${fileName}`;
  } catch (error) {
    console.error('Error during upload:', error);
    throw error;
  } finally {
    await sftp.end();
  }
}

// Implement other helper functions similarly
// Helper function to process PDF content
async function processPDFContent(pdfFile, characterMap) {

    
const arrayBuffer = await pdfFile.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
const parsePDF = await getPDFParser();
const pdfData = await parsePDF(buffer);

if (!pdfData || !pdfData.text) {
    throw new Error('Failed to parse PDF content');
  }

//   const parsePDF = await import('pdf-parse/lib/pdf-parse.js');
//   const fs = await import('fs');
  
//   const buffer = fs.readFileSync(filePath);
//   const pdfData = await parsePDF(buffer);
  
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

      return { characterId, message };
    })
    .filter(line => line !== null);
}

// Helper function to process characters
async function processCharacters(storyId, characters) {
  const savedCharacters = [];

  for (let character of characters) {
    // Check if character already exists
    const existingCharacter = await db
      .select()
      .from(CHARACTERS)
      .where(
        and(
          eq(CHARACTERS.story_id, storyId),
          eq(CHARACTERS.name, character.name)
        )
      )
      .limit(1);

    let characterId;
    if (existingCharacter.length === 0) {
      // Insert new character
      const result = await db.insert(CHARACTERS).values({
        story_id: storyId,
        name: character.name,
        is_sender: character.isSender
      });
      characterId = result[0].insertId;
    } else {
      characterId = existingCharacter[0].id;
    }

    savedCharacters.push({ 
      id: characterId, 
      name: character.name 
    });
  }

  return savedCharacters;
}
