  import { NextResponse } from 'next/server';
  import fs from 'fs';
  import os from 'os';
  import path from 'path';
  import Client from 'ssh2-sftp-client';
  import { db } from '@/utils';
  import { STORIES, CHARACTERS, EPISODES, SLIDES, SLIDE_CONTENT, CHAT_MESSAGES, QUIZ_OPTIONS, QUIZZES, PEDOMETER_TASKS, LOCATION_TASKS } from '@/utils/schema';
  import { authenticate } from '@/lib/jwtMiddleware';
  import { eq, and, desc } from 'drizzle-orm';

  export const maxDuration = 300; // This function can run for a maximum of 5 seconds
  export const dynamic = 'force-dynamic';

  export const maxBodyLength = 1024 * 1024 * 100; // 100MB


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
      const episode_audio_url = formData.get('episodeAudio');
      const slides = JSON.parse(formData.get('slides') || '[]');

      // Validate quiz slides
      for (const slide of slides) {
        if (slide.type === 'quiz') {
          if (!slide.content.question?.trim()) {
            throw new Error('Quiz question is required');
          }
          
          if (slide.content.quizType === 'multiple') {
            if (slide.content.options.filter(opt => opt.is_correct).length !== 1) {
              throw new Error('Exactly one correct answer must be selected for multiple choice quiz');
            }
            if (slide.content.options.some(opt => !opt.text.trim())) {
              throw new Error('All quiz options must have text');
            }
          } else if (slide.content.quizType === 'normal') {
            if (!slide.content.answer?.trim()) {
              throw new Error('Answer is required for normal quiz');
            }
          }
        }
      }

     // Validate pedometer slides
      for (const slide of slides) {
        if (slide.type === 'pedometer') {
          if (!slide.content.description?.trim()) {
            throw new Error('Pedometer task description is required');
          }
          if (!slide.content.targetSteps || slide.content.targetSteps <= 0) {
            throw new Error('Valid number of steps is required for pedometer task');
          }
        }
      }
    
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
        episode_number: nextEpisodeNumber,
        audio_url: episode_audio_url
      });

      const episodeId = episodeResult[0].insertId;

      // Process slides
      for (let [position, slide] of slides.entries()) {
        console.log("slide", slide)
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
          await db.insert(SLIDE_CONTENT).values({
            slide_id: slideId,
            media_type: slide.content.media?.type || 'image',
            media_url: slide.content.media?.name || null, // Use the filename from cPanel upload
            audio_url: slide.content.audio?.name || null, // Use the audio filename from cPanel upload
            description: slide.content.description || ''
          });
        } else if (slide.type === 'chat') {
          // Process characters
          const characters = JSON.parse(formData.get('characters') || '[]');
          const characterIds = await processCharacters(storyId, characters);

          // Handle different input types
          if (slide.content.inputType === 'manual') {
            console.log("in the manuall");

            for (let [sequence, line] of slide.content.storyLines.entries()) {
              const characterId = characterIds.find(c => c.name === line.character)?.id;
              
              if (characterId) {
                await db.insert(CHAT_MESSAGES).values({
                  story_id: storyId,
                  episode_id: episodeId,
                  slide_id: slideId,
                  character_id: characterId,
                  message: line.line,
                  sequence
                });
              }
            }
          } else if (slide.content.inputType === 'pdf') {
            console.log("in the pdf");
            
            const pdfFile = formData.get(`slides[${position}].pdfFile`);
            
            if (pdfFile) {
              console.log("in the if pdf");
              const pdfContent = await processPDFContent(
                pdfFile, 
                new Map(characterIds.map(c => [c.name.toLowerCase(), c.id]))
              );

              for (let [sequence, { characterId, message }] of pdfContent.entries()) {
                await db.insert(CHAT_MESSAGES).values({
                  story_id: storyId,
                  episode_id: episodeId,
                  slide_id: slideId,
                  character_id: characterId,
                  message,
                  sequence
                });
              }
            }
          }

          await db.insert(SLIDE_CONTENT).values({
            slide_id: slideId,
            audio_url: slide.content.audio?.name || null, // Use the audio filename
          });
        } else if (slide.type === 'conversation') {
          // Process characters (same as chat slide)
          const characters = JSON.parse(formData.get('characters') || '[]');
          const characterIds = await processCharacters(storyId, characters);
        
          // Handle different input types
          if (slide.content.inputType === 'manual') {
            console.log("in the manuall");

            for (let [sequence, line] of slide.content.storyLines.entries()) {
              const characterId = characterIds.find(c => c.name === line.character)?.id;
              
              if (characterId) {
                await db.insert(CHAT_MESSAGES).values({
                  story_id: storyId,
                  episode_id: episodeId,
                  slide_id: slideId,
                  character_id: characterId,
                  message: line.line,
                  sequence
                });
              }
            }
          } else if (slide.content.inputType === 'pdf') {
            console.log("in the pdf");
            const pdfFile = formData.get(`slides[${position}].pdfFile`);
            
            if (pdfFile) {
              console.log("in the if pdf");
              const pdfContent = await processPDFContent(
                pdfFile, 
                new Map(characterIds.map(c => [c.name.toLowerCase(), c.id]))
              );
        
              for (let [sequence, { characterId, message }] of pdfContent.entries()) {
                await db.insert(CHAT_MESSAGES).values({
                  story_id: storyId,
                  episode_id: episodeId,
                  slide_id: slideId,
                  character_id: characterId,
                  message,
                  sequence
                });
              }
            }
          }
        
          // Insert slide content with background image
          await db.insert(SLIDE_CONTENT).values({
            slide_id: slideId,
            media_type: 'image',
            media_url: slide.content.backgroundImage?.name || null, // Use the background image filename
            audio_url: slide.content.audio?.name || null, // Use the audio filename
          });
        }else if (slide.type === 'quiz') {
          // Create quiz entry
          const correctAnswer = slide.content.quizType === 'multiple' 
            ? slide.content.options.find(opt => opt.is_correct)?.text || ''
            : slide.content.answer;
        
          const quizResult = await db.insert(QUIZZES).values({
            slide_id: slideId,
            question: slide.content.question,
            answer_type: slide.content.quizType === 'multiple' ? 'multiple_choice' : 'text',
            correct_answer: correctAnswer
          });
          const quizId = quizResult[0].insertId;
        
          // Insert slide content
          await db.insert(SLIDE_CONTENT).values({
            slide_id: slideId,
            media_type: slide.content.media?.type || 'image',
            media_url: slide.content.media?.name || null,
            audio_url: slide.content.audio?.name || null,
            description: slide.content.description || '',
            chat_story_id: storyId,
            quiz_id: quizId
          });
          
          // Insert quiz options only for multiple choice
          if (slide.content.quizType === 'multiple') {
            for (const option of slide.content.options) {
              await db.insert(QUIZ_OPTIONS).values({
                quiz_id: quizId,
                option_text: option.text,
                is_correct: option.is_correct
              });
            }
          }
        } else if (slide.type === 'pedometer') {
          // Create pedometer task entry
          await db.insert(PEDOMETER_TASKS).values({
            slide_id: slideId,
            required_steps: slide.content.targetSteps,
            description: slide.content.description
          });
        
          // Insert slide content for audio
          await db.insert(SLIDE_CONTENT).values({
            slide_id: slideId,
            audio_url: slide.content.audio?.name || null,
          });
        } else if (slide.type === 'location') {
          // Create pedometer task entry
          await db.insert(LOCATION_TASKS).values({
            slide_id: slideId,
            description: slide.content.description,
            latitude: slide.content.latitude,
            longitude: slide.content.longitude,
            radius: slide.content.radius
          });
        
          // Insert slide content for audio
          await db.insert(SLIDE_CONTENT).values({
            slide_id: slideId,
            audio_url: slide.content.audio?.name || null,
          });
        }
      }
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

  async function uploadAudio(file) {
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

      const cPanelDirectory = '/home/devusr/public_html/testusr/audio';
      await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

      return `${fileName}`;
    } catch (error) {
      console.error('Error during audio upload:', error);
      throw error;
    } finally {
      await sftp.end();
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