import { parse as parsePDF } from 'pdf-parse';
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from '../../../utils';
import { CHARACTERS, CHAT_MESSAGES } from '../../../utils/schema';
import { authenticate } from '../../../lib/jwtMiddleware';

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

    // Fetch all characters for this story for name matching
    const characters = await db
      .select({
        id: CHARACTERS.id,
        name: CHARACTERS.name
      })
      .from(CHARACTERS)
      .where(eq(CHARACTERS.story_id, storyId));

    // Create a map of character names to IDs (case insensitive)
    const characterMap = new Map(
      characters.map(char => [char.name.toLowerCase(), char.id])
    );

    if (inputType === 'manual') {
      // Handle manual entry
      const storyLines = JSON.parse(formData.get('storyLines'));
      
      const messagePromises = storyLines.map((line, index) => 
        db.insert(CHAT_MESSAGES).values({
          story_id: storyId,
          episode_id: selectedEpisode,
          character_id: line.character,
          message: line.line,
          sequence: index + 1
        })
      );
      
      await Promise.all(messagePromises);
    } else {
      // Handle PDF upload
      const pdfFile = formData.get('pdfFile');
      if (!pdfFile) {
        return NextResponse.json(
          { error: 'PDF file is required' },
          { status: 400 }
        );
      }

      // Convert file to buffer for pdf-parse
      const buffer = Buffer.from(await pdfFile.arrayBuffer());
      const pdfData = await parsePDF(buffer);
      
      // Parse the PDF text content
      // Expected format: "CharacterName: Message"
      const lines = pdfData.text
        .split('\n')
        .filter(line => line.trim())  // Remove empty lines
        .map(line => {
          const [charName, ...messageParts] = line.split(':');
          return {
            characterName: charName.trim(),
            message: messageParts.join(':').trim()
          };
        })
        .filter(({ characterName, message }) => 
          characterName && message && characterMap.has(characterName.toLowerCase())
        );

      // Insert parsed messages
      const messagePromises = lines.map((line, index) => 
        db.insert(CHAT_MESSAGES).values({
          story_id: storyId,
          episode_id: selectedEpisode,
          character_id: characterMap.get(line.characterName.toLowerCase()),
          message: line.message,
          sequence: index + 1
        })
      );

      await Promise.all(messagePromises);
    }

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