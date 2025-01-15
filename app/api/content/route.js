// import { parse as parsePDF } from 'pdf-parse';
// import { eq } from "drizzle-orm";
// import { NextResponse } from "next/server";
// import { db } from '../../../utils';
// import { CHARACTERS, CHAT_MESSAGES } from '../../../utils/schema';
// import { authenticate } from '../../../lib/jwtMiddleware';

// export async function POST(request) {
//   const authResult = await authenticate(request, true);
//   if (!authResult.authenticated) {
//     return authResult.response;
//   }

//   try {
//     const formData = await request.formData();
//     const storyId = formData.get('storyId');
//     const selectedEpisode = formData.get('selectedEpisode');
//     const inputType = formData.get('inputType');

//     // Fetch all characters for this story for name matching
//     const characters = await db
//       .select({
//         id: CHARACTERS.id,
//         name: CHARACTERS.name
//       })
//       .from(CHARACTERS)
//       .where(eq(CHARACTERS.story_id, storyId));

//     // Create a map of character names to IDs (case insensitive)
//     const characterMap = new Map(
//       characters.map(char => [char.name.toLowerCase(), char.id])
//     );

//     if (inputType === 'manual') {
//       // Handle manual entry
//       const storyLines = JSON.parse(formData.get('storyLines'));
      
//       const messagePromises = storyLines.map((line, index) => 
//         db.insert(CHAT_MESSAGES).values({
//           story_id: storyId,
//           episode_id: selectedEpisode,
//           character_id: line.character,
//           message: line.line,
//           sequence: index + 1
//         })
//       );
      
//       await Promise.all(messagePromises);
//     } else {
//       // Handle PDF upload
//         const pdfFile = formData.get('pdfFile');
//         if (!pdfFile) {
//           return NextResponse.json(
//             { error: 'PDF file is required' },
//             { status: 400 }
//           );
//         }
//     // Convert file to buffer for pdf-parse
//       const arrayBuffer = await pdfFile.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);
//       const pdfData = await parsePDF(buffer);

      
//       // Parse the PDF text content
//       // Expected format: "CharacterName: Message"
//       const lines = pdfData.text
//         .split('\n')
//         .filter(line => line.trim())  // Remove empty lines
//         .map(line => {
//           const [charName, ...messageParts] = line.split(':');
//           return {
//             characterName: charName.trim(),
//             message: messageParts.join(':').trim()
//           };
//         })
//         .filter(({ characterName, message }) => 
//           characterName && message && characterMap.has(characterName.toLowerCase())
//         );

//       // Insert parsed messages
//       const messagePromises = lines.map((line, index) => 
//         db.insert(CHAT_MESSAGES).values({
//           story_id: storyId,
//           episode_id: selectedEpisode,
//           character_id: characterMap.get(line.characterName.toLowerCase()),
//           message: line.message,
//           sequence: index + 1
//         })
//       );

//       await Promise.all(messagePromises);
//     }

//     return NextResponse.json(
//       { message: 'Story content saved successfully' },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error saving story content:', error);
//     return NextResponse.json(
//       { error: 'Failed to save story content' },
//       { status: 500 }
//     );
//   }
// }

import { parse as parsePDF } from 'pdf-parse';
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from '../../../utils';
import { CHARACTERS, CHAT_MESSAGES } from '../../../utils/schema';
import { authenticate } from '../../../lib/jwtMiddleware';

// Move PDF parsing logic to a separate function
async function processPDFContent(buffer, characterMap) {
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

    if (!storyId || !selectedEpisode) {
      return NextResponse.json(
        { error: 'Story ID and episode are required' },
        { status: 400 }
      );
    }

    // Fetch characters
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

    // Insert all lines
    const messagePromises = linesToInsert.map((line, index) => 
      db.insert(CHAT_MESSAGES).values({
        story_id: storyId,
        episode_id: selectedEpisode,
        character_id: line.characterId,
        message: line.message,
        sequence: index + 1
      })
    );

    await Promise.all(messagePromises);

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