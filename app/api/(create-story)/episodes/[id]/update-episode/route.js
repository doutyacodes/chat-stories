import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { EPISODES, SLIDES, SLIDE_CONTENT, CHAT_MESSAGES, CHARACTERS, QUIZZES, QUIZ_OPTIONS, PEDOMETER_TASKS, LOCATION_TASKS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, gte, lt } from 'drizzle-orm';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const maxBodyLength = 1024 * 1024 * 100;

// async function processChat(trx, slide, slideId, storyId, episodeId, formData) {
//   if (slide.content.inputType === 'manual') {
//     const characters = slide.content.characters;
//     const characterIds = await processCharacters(trx, storyId, characters);

//     // Update the chat section in the processChat function
//     if (slide.changes.contentModified || slide.changes.audioModified) {
//       const updateData = {};
      
//       if (slide.changes.audioModified) {
//         updateData.audio_url = slide.content.media?.file || null;
//       }

//       if (Object.keys(updateData).length > 0) {
//         await trx.update(SLIDE_CONTENT)
//           .set(updateData)
//           .where(eq(SLIDE_CONTENT.slide_id, slideId));
//       }

//       if (slide.changes.contentModified && slide.changes.storyLineChanges) {
//         await trx.delete(CHAT_MESSAGES)
//           .where(eq(CHAT_MESSAGES.slide_id, slideId));

//         for (const [index, line] of slide.content.storyLines.entries()) {
//           const characterId = characterIds.find(c => c.name === line.character)?.id;
//           if (characterId) {
//             await trx.insert(CHAT_MESSAGES).values({
//               story_id: storyId,
//               episode_id: episodeId,
//               slide_id: slideId,
//               character_id: characterId,
//               message: line.line,
//               sequence: index
//             });
//           }
//         }
//       }
//     }

//   } else if (slide.content.inputType === 'pdf') {
//     const pdfFile = formData.get(`slides.${slide.id}.pdfFile`);
//     if (pdfFile) {
//       const characters = slide.content.characters;
//       const characterIds = await processCharacters(trx, storyId, characters);
      
//       const pdfContent = await processPDFContent(
//         pdfFile, 
//         new Map(characterIds.map(c => [c.name.toLowerCase(), c.id]))
//       );

//       await trx
//         .delete(CHAT_MESSAGES)
//         .where(eq(CHAT_MESSAGES.slide_id, slideId));

//       for (let [index, { characterId, message }] of pdfContent.entries()) {
//         await trx.insert(CHAT_MESSAGES).values({
//           story_id: storyId,
//           episode_id: episodeId,
//           slide_id: slideId,
//           character_id: characterId,
//           message,
//           sequence: index
//         });
//       }
//     }
//   }
// }

// Import this at the top
async function getPDFParser() {
  const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
  return pdfParse;
}

async function processChat(trx, slide, slideId, storyId, episodeId, formData) {
  if (slide.content.inputType === 'manual') {
    const characters = slide.content.characters;
    const characterIds = await processCharacters(trx, storyId, characters);

    if (slide.changes.contentModified || slide.changes.audioModified || slide.changes.mediaModified) {
      const updateData = {};
      
      if (slide.changes.audioModified) {
        updateData.audio_url = slide.content.media?.file || null;
      }

      if (slide.changes.mediaModified) {
        updateData.media_url = slide.content.media?.file || null;
        updateData.media_type = slide.content.media?.type || 'image';
      }

      if (Object.keys(updateData).length > 0) {
        await trx.update(SLIDE_CONTENT)
          .set(updateData)
          .where(eq(SLIDE_CONTENT.slide_id, slideId));
      }

      // Process story line changes if they exist
      if (slide.changes.contentModified && slide.changes.storyLineChanges) {
        const storyLineChanges = slide.changes.storyLineChanges;
        
        for (const [messageIdOrIndex, change] of Object.entries(storyLineChanges)) {
          if (change.id) {
            // Update existing message
            await trx.update(CHAT_MESSAGES)
              .set({
                message: change.line || slide.content.storyLines.find(line => line.id === change.id)?.line,
                character_id: characterIds.find(c => c.name === (change.character || 
                  slide.content.storyLines.find(line => line.id === change.id)?.character))?.id
              })
              .where(eq(CHAT_MESSAGES.id, change.id));
          } else {
            // Find the story line by index
            const storyLine = slide.content.storyLines[parseInt(messageIdOrIndex)];
            if (storyLine) {
              // This is a new message
              const characterId = characterIds.find(c => c.name === storyLine.character)?.id;
              if (characterId) {
                await trx.insert(CHAT_MESSAGES).values({
                  story_id: storyId,
                  episode_id: episodeId,
                  slide_id: slideId,
                  character_id: characterId,
                  message: storyLine.line,
                  sequence: parseInt(messageIdOrIndex)
                });
              }
            }
          }
        }
      }
    }
  } else if (slide.content.inputType === 'pdf' && slide.changes.pdfModified) {

    const updateData = {};
      
    if (slide.changes.audioModified) {
      updateData.audio_url = slide.content.media?.file || null;
    }

    if (slide.changes.mediaModified) {
      updateData.media_url = slide.content.media?.file || null;
      updateData.media_type = slide.content.media?.type || 'image';
    }

    if (Object.keys(updateData).length > 0) {
      await trx.update(SLIDE_CONTENT)
        .set(updateData)
        .where(eq(SLIDE_CONTENT.slide_id, slideId));
    }

    console.log("modfief pfs")
    const pdfFile = formData.get(`slides.${slide.id}.pdfFile`);
    if (pdfFile) {
      console.log("in the pddf ")
      const characters = slide.content.characters;
      console.log("ids", slideId, storyId, episodeId);
      console.log("characters", characters);
      const characterIds = await processCharacters(trx, storyId, characters);
      
      // Delete all existing messages for this slide since we're replacing them
      await trx.delete(CHAT_MESSAGES)
        .where(eq(CHAT_MESSAGES.slide_id, slideId));
      /* trying both methods just incse if it saved usinf without a lside id (old method) */
      await trx.delete(CHAT_MESSAGES)
      .where(
        and(
          eq(CHAT_MESSAGES.story_id, storyId),
          eq(CHAT_MESSAGES.episode_id, episodeId)
        )
      );

      console.log("After delete")

      
      const pdfContent = await processPDFContent(
        pdfFile, 
        new Map(characterIds.map(c => [c.name.toLowerCase(), c.id]))
      );

      for (let [index, { characterId, message }] of pdfContent.entries()) {
        await trx.insert(CHAT_MESSAGES).values({
          story_id: storyId,
          episode_id: episodeId,
          slide_id: slideId,
          character_id: characterId,
          message,
          sequence: index
        });
      }
    }
  }
}

async function processCharacters(trx, storyId, characters) {
  const savedCharacters = [];

  for (let character of characters) {
    const existingCharacter = await trx
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
      const result = await trx.insert(CHARACTERS).values({
        story_id: storyId,
        name: character.name,
        is_sender: character.isSender
      });
      characterId = result[0].insertId;
    } else {
      characterId = existingCharacter[0].id;
    }

    savedCharacters.push({ id: characterId, name: character.name });
  }

  return savedCharacters;
}


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

export async function PUT(request, { params }) {
  const { id: episodeId } = params;
  const authResult = await authenticate(request);
  if (!authResult.authenticated) return authResult.response;

  try {
    const formData = await request.formData();
    const storyId = parseInt(formData.get('storyId'));
    
    await db.transaction(async (trx) => {
      // if (formData.has('name') || formData.has('synopsis')) {
      //   await trx
      //     .update(EPISODES)
      //     .set({
      //       name: formData.get('name'),
      //       synopsis: formData.get('synopsis')
      //     })
      //     .where(eq(EPISODES.id, episodeId));
      // }

      if (formData.has('name') || formData.has('synopsis') || formData.get('episodeAudioModified')) {
        const updateData = {};
        if (formData.has('name')) updateData.name = formData.get('name');
        if (formData.has('synopsis')) updateData.synopsis = formData.get('synopsis');
        
        // Handle episode audio
        if (formData.get('episodeAudioModified')) {
          if (formData.get('removeEpisodeAudio') === 'true') {
            updateData.audio_url = null;
          } else if (formData.get('episodeAudio')) {
            const audioFile = formData.get('episodeAudio');
            // Assuming you have a function to handle file upload and return the URL
            console.log("audiofuile, ", audioFile);
            
            updateData.audio_url = audioFile;
          }
        }
      
        await trx
          .update(EPISODES)
          .set(updateData)
          .where(eq(EPISODES.id, episodeId));
      }

      console.log("log 1")

      const modifiedSlides = JSON.parse(formData.get('modifiedSlides') || '[]');
      const deletedSlideIds = formData.get('deletedSlides') ? JSON.parse(formData.get('deletedSlides')) : [];

      for (const slide of modifiedSlides) {
        if (slide.isNew) {
          const slideResult = await trx
            .insert(SLIDES)
            .values({
              story_id: storyId,
              episode_id: episodeId,
              slide_type: slide.type,
              position: slide.position
            });

          const slideId = slideResult[0].insertId;

          if (slide.type === 'image') {
            await trx.insert(SLIDE_CONTENT).values({
              slide_id: slideId,
              media_type: slide.content.media?.type || 'image',
              media_url: slide.content.media?.file || null,
              audio_url: slide.content.media?.file || null,
              description: slide.content.description || ''
            });
            console.log("log 2")


          } else if (slide.type === 'chat') {
            await processChat(trx, slide, slideId, storyId, episodeId, formData);
          } else if (slide.type === 'conversation') {
            await processChat(trx, slide, slideId, storyId, episodeId, formData);
          } else if (slide.type === 'quiz') {
            const correctAnswer = slide.content.options.find(opt => opt.is_correct)?.text || '';
            const quizResult = await trx.insert(QUIZZES).values({
              slide_id: slideId,
              question: slide.content.question,
              answer_type: 'multiple_choice',
              correct_answer: correctAnswer
            });

            const quizId = quizResult[0].insertId;

            await trx.insert(SLIDE_CONTENT).values({
              slide_id: slideId,
              media_type: slide.content.media?.type || 'image',
              media_url: slide.content.media?.file || null,
              audio_url: slide.content.media?.file || null,
              quiz_id: quizId
            });

            for (const option of slide.content.options) {
              await trx.insert(QUIZ_OPTIONS).values({
                quiz_id: quizId,
                option_text: option.text,
                is_correct: option.is_correct
              });
            }
          } else if (slide.type === 'pedometer') {
            await trx.insert(SLIDE_CONTENT).values({
              slide_id: slideId,
              audio_url: slide.content.audio?.file || null,
            });
          
            await trx.insert(PEDOMETER_TASKS).values({
              slide_id: slideId,
              required_steps: slide.content.targetSteps,
              description: slide.content.description
            });
          }
          else if (slide.type === 'location') {
            await trx.insert(SLIDE_CONTENT).values({
              slide_id: slideId,
              audio_url: slide.content.audio?.file || null,
            });
          
            await trx.insert(LOCATION_TASKS).values({
              slide_id: slideId,
              latitude: slide.content.latitude,
              longitude: slide.content.longitude,
              radius: slide.content.radius,
              description: slide.content.description
            });
          }
        } else {
          if (slide.changes.positionModified) {
            await trx
              .update(SLIDES)
              .set({ position: slide.position })
              .where(eq(SLIDES.id, slide.id));
          }

          if (slide.type === 'image') {
            if (slide.changes.mediaModified || slide.changes.descriptionModified || slide.changes.audioModified) {
              const updateData = {
                description: slide.content.description
              };
              
              if (slide.changes.mediaModified) {
                updateData.media_url = slide.content.media?.file || null;
                updateData.media_type = slide.content.media?.type || 'image';
              }
              
              if (slide.changes.audioModified) {
                updateData.audio_url = slide.content.media?.file || null;
              }
              
              await trx
                .update(SLIDE_CONTENT)
                .set(updateData)
                .where(eq(SLIDE_CONTENT.slide_id, slide.id));
            }
          } else if (slide.type === 'chat') {
            if (slide.changes.contentModified || slide.changes.audioModified) {
              await processChat(trx, slide, slide.id, storyId, episodeId, formData);
            }
          } else if (slide.type === 'conversation') {
            if (slide.changes.contentModified || slide.changes.audioModified || slide.changes.mediaModified) {
              await processChat(trx, slide, slide.id, storyId, episodeId, formData);
            }
          } else if (slide.type === 'quiz') {
            if (slide.changes.questionModified || slide.changes.optionsModified || 
                slide.changes.mediaModified || slide.changes.audioModified) {
              
              const updateData = {};
              
              if (slide.changes.mediaModified) {
                updateData.media_url = slide.content.media?.file || null;
                updateData.media_type = slide.content.media?.type || 'image';
              }
              
              if (slide.changes.audioModified) {
                updateData.audio_url = slide.content.media?.file || null;
              }
          
              if (Object.keys(updateData).length > 0) {
                await trx.update(SLIDE_CONTENT)
                  .set(updateData)
                  .where(eq(SLIDE_CONTENT.slide_id, slide.id));
              }
          
              if (slide.changes.questionModified) {
                await trx.update(QUIZZES)
                  .set({ question: slide.content.question })
                  .where(eq(QUIZZES.slide_id, slide.id));
              }
          
              if (slide.changes.optionsModified) {
                const quiz = await trx.select().from(QUIZZES)
                  .where(eq(QUIZZES.slide_id, slide.id))
                  .limit(1);
                
                if (quiz[0]) {
                  await trx.delete(QUIZ_OPTIONS)
                    .where(eq(QUIZ_OPTIONS.quiz_id, quiz[0].id));
          
                  for (const option of slide.content.options) {
                    await trx.insert(QUIZ_OPTIONS).values({
                      quiz_id: quiz[0].id,
                      option_text: option.text,
                      is_correct: option.is_correct
                    });
                  }
                }
              }
            }
          } else if (slide.type === 'pedometer') {
            if (slide.changes.descriptionModified || slide.changes.targetStepsModified || slide.changes.audioModified) {
              if (slide.changes.audioModified) {
                await trx
                  .update(SLIDE_CONTENT)
                  .set({ audio_url: slide.content.audio?.file || null })
                  .where(eq(SLIDE_CONTENT.slide_id, slide.id));
              }
          
              await trx
                .update(PEDOMETER_TASKS)
                .set({
                  required_steps: slide.content.targetSteps,
                  description: slide.content.description
                })
                .where(eq(PEDOMETER_TASKS.slide_id, slide.id));
            }
          } else if (slide.type === 'location') {
            if (slide.changes.descriptionModified || slide.changes.latitudeModified || 
                slide.changes.longitudeModified || slide.changes.radiusModified || slide.changes.audioModified) {
              
              if (slide.changes.audioModified) {
                await trx
                  .update(SLIDE_CONTENT)
                  .set({ audio_url: slide.content.audio?.file || null })
                  .where(eq(SLIDE_CONTENT.slide_id, slide.id));
              }
          
              await trx
                .update(LOCATION_TASKS)
                .set({
                  latitude: slide.content.latitude,
                  longitude: slide.content.longitude,
                  radius: slide.content.radius,
                  description: slide.content.description
                })
                .where(eq(LOCATION_TASKS.slide_id, slide.id));
            }
          }
        }
      }

      // Update the deletion section at the end of the transaction
      if (deletedSlideIds.length > 0) {
        for (const slideId of deletedSlideIds) {
          await trx.delete(SLIDES).where(eq(SLIDES.id, slideId));
        }
}
      // Handle deleted slides if any
      // const deletedSlides = modifiedSlides.filter(slide => slide.changes.deleted);
      // for (const slide of deletedSlides) {
      //   await trx.delete(SLIDES).where(eq(SLIDES.id, slide.id));
      // }
    });

    return NextResponse.json({ message: 'Episode updated successfully' });
  } catch (error) {
    console.error('Error updating episode:', error);
    return NextResponse.json(
      { error: 'Failed to update episode', details: error.message },
      { status: 500 }
    );
  }
}

