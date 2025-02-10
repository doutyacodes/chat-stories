import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { EPISODES, SLIDES, SLIDE_CONTENT, CHAT_MESSAGES, CHARACTERS, QUIZZES, QUIZ_OPTIONS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, gte, lt } from 'drizzle-orm';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const maxBodyLength = 1024 * 1024 * 100;

async function processChat(trx, slide, slideId, storyId, episodeId, formData) {
  if (slide.content.inputType === 'manual') {
    const characters = slide.content.characters;
    const characterIds = await processCharacters(trx, storyId, characters);

    // await trx
    //   .delete(CHAT_MESSAGES)
    //   .where(
    //     and(
    //       eq(CHAT_MESSAGES.story_id, storyId),
    //       eq(CHAT_MESSAGES.episode_id, episodeId),
    //       eq(CHAT_MESSAGES.slide_id, slideId)
    //     )
    //   );

    // for (let [index, line] of slide.content.storyLines.entries()) {
    //   const characterId = characterIds.find(c => c.name === line.character)?.id;
    //   if (characterId) {
    //     await trx.insert(CHAT_MESSAGES).values({
    //       story_id: storyId,
    //       episode_id: episodeId,
    //       slide_id: slideId,
    //       character_id: characterId,
    //       message: line.line,
    //       sequence: index
    //     });
    //   }
    // }

    // await trx.update(SLIDE_CONTENT).values({
    //   audio_url: slide.content.audio?.name || null
    // }).where(eq(SLIDE_CONTENT.slide_id, slideId));

    // Update the chat section in the processChat function
    if (slide.changes.contentModified || slide.changes.audioModified) {
      const updateData = {};
      
      if (slide.changes.audioModified) {
        updateData.audio_url = slide.content.audio?.name || null;
      }

      if (Object.keys(updateData).length > 0) {
        await trx.update(SLIDE_CONTENT)
          .set(updateData)
          .where(eq(SLIDE_CONTENT.slide_id, slideId));
      }

      if (slide.changes.contentModified && slide.changes.storyLineChanges) {
        await trx.delete(CHAT_MESSAGES)
          .where(eq(CHAT_MESSAGES.slide_id, slideId));

        for (const [index, line] of slide.content.storyLines.entries()) {
          const characterId = characterIds.find(c => c.name === line.character)?.id;
          if (characterId) {
            await trx.insert(CHAT_MESSAGES).values({
              story_id: storyId,
              episode_id: episodeId,
              slide_id: slideId,
              character_id: characterId,
              message: line.line,
              sequence: index
            });
          }
        }
      }
    }

  } else if (slide.content.inputType === 'pdf') {
    const pdfFile = formData.get(`slides.${slide.id}.pdfFile`);
    if (pdfFile) {
      const characters = slide.content.characters;
      const characterIds = await processCharacters(trx, storyId, characters);
      
      const pdfContent = await processPDFContent(
        pdfFile, 
        new Map(characterIds.map(c => [c.name.toLowerCase(), c.id]))
      );

      await trx
        .delete(CHAT_MESSAGES)
        .where(eq(CHAT_MESSAGES.slide_id, slideId));

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

export async function PUT(request, { params }) {
  const { id: episodeId } = params;
  const authResult = await authenticate(request);
  if (!authResult.authenticated) return authResult.response;

  try {
    const formData = await request.formData();
    const storyId = parseInt(formData.get('storyId'));
    
    await db.transaction(async (trx) => {
      if (formData.has('name') || formData.has('synopsis')) {
        await trx
          .update(EPISODES)
          .set({
            name: formData.get('name'),
            synopsis: formData.get('synopsis')
          })
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
              audio_url: slide.content.audio?.file || null,
              description: slide.content.description || ''
            });
            console.log("log 2")


          } else if (slide.type === 'chat') {
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
              audio_url: slide.content.audio?.file || null,
              quiz_id: quizId
            });

            for (const option of slide.content.options) {
              await trx.insert(QUIZ_OPTIONS).values({
                quiz_id: quizId,
                option_text: option.text,
                is_correct: option.is_correct
              });
            }
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
                updateData.audio_url = slide.content.audio?.name || null;
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
          } else // Update the quiz modification section
          if (slide.type === 'quiz') {
            if (slide.changes.questionModified || slide.changes.optionsModified || 
                slide.changes.mediaModified || slide.changes.audioModified) {
              
              const updateData = {};
              
              if (slide.changes.mediaModified) {
                updateData.media_url = slide.content.media?.file || null;
                updateData.media_type = slide.content.media?.type || 'image';
              }
              
              if (slide.changes.audioModified) {
                updateData.audio_url = slide.content.audio?.file || null;
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