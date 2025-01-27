import { NextResponse } from 'next/server';
import { db } from '@/utils';
import Client from 'ssh2-sftp-client';
import { EPISODES, SLIDES, SLIDE_CONTENT, CHAT_MESSAGES, CHARACTERS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

// Helper function for processing chat content
async function processChat(trx, slide, slideId, formData) {
    if (slide.content.inputType === 'manual') {
      const characters = slide.content.characters;
      const characterIds = await processCharacters(trx, slide.story_id, characters);
  
      // Delete existing messages for this position range
      await trx
        .delete(CHAT_MESSAGES)
        .where(
          and(
            eq(CHAT_MESSAGES.story_id, slide.story_id),
            eq(CHAT_MESSAGES.episode_id, slide.episode_id),
            gte(CHAT_MESSAGES.sequence, slide.position * 100),
            lt(CHAT_MESSAGES.sequence, (slide.position + 1) * 100)
          )
        );
  
      // Insert new messages
      for (let [index, line] of slide.content.storyLines.entries()) {
        const characterId = characterIds.find(c => c.name === line.character)?.id;
        if (characterId) {
          await trx.insert(CHAT_MESSAGES).values({
            story_id: slide.story_id,
            episode_id: slide.episode_id,
            character_id: characterId,
            message: line.line,
            // Use position-based sequence numbers to maintain slide association
            sequence: (slide.position * 100) + index
          });
        }
      }
    } else if (slide.content.inputType === 'pdf') {
      const pdfFile = formData.get(`slides.${slide.id}.pdfFile`);
      if (pdfFile) {
        const characters = slide.content.characters;
        const characterIds = await processCharacters(trx, slide.story_id, characters);
        
        // Delete existing messages for this position range
        await trx
          .delete(CHAT_MESSAGES)
          .where(
            and(
              eq(CHAT_MESSAGES.story_id, slide.story_id),
              eq(CHAT_MESSAGES.episode_id, slide.episode_id),
              gte(CHAT_MESSAGES.sequence, slide.position * 100),
              lt(CHAT_MESSAGES.sequence, (slide.position + 1) * 100)
            )
          );
  
        const pdfContent = await processPDFContent(
          pdfFile, 
          new Map(characterIds.map(c => [c.name.toLowerCase(), c.id]))
        );
  
        // Insert new messages from PDF
        for (let [index, { characterId, message }] of pdfContent.entries()) {
          await trx.insert(CHAT_MESSAGES).values({
            story_id: slide.story_id,
            episode_id: slide.episode_id,
            character_id: characterId,
            message,
            sequence: (slide.position * 100) + index
          });
        }
      }
    }
  }

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
  

// Lazy load pdf-parse only when needed
async function getPDFParser() {
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
    return pdfParse;
}

export async function PUT(request, { params }) {

const { id:episodeId } = params; // Extract `storyId` from the route parameters

  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const formData = await request.formData();
    
    // Start a transaction
    await db.transaction(async (trx) => {
      // Update episode basic details if modified
      if (formData.has('name') || formData.has('synopsis')) {
        await trx
          .update(EPISODES)
          .set({
            name: formData.get('name'),
            synopsis: formData.get('synopsis')
          })
          .where(eq(EPISODES.id, episodeId));
      }

      // Process modified slides
      const modifiedSlides = JSON.parse(formData.get('modifiedSlides') || '[]');
      const storyId = JSON.parse(formData.get('storyId'));
      console.log("storyId", storyId)
      for (const slide of modifiedSlides) {
        if (slide.isNew) {
          // Handle new slide creation
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
            const imageFile = formData.get(`slides.${slide.id}.file`);
            let mediaUrl = null;
            if (imageFile) {
              mediaUrl = await uploadImage(imageFile);
            }

            await trx
              .insert(SLIDE_CONTENT)
              .values({
                slide_id: slideId,
                media_type: 'image',
                media_url: mediaUrl,
                description: slide.content.description
              });

          } else if (slide.type === 'chat') {
            // Process chat content similar to creation
            await processChat(trx, slide, slideId, formData);
          }
        } else {
          // Handle slide updates
          if (slide.positionModified) {
            
            await trx
              .update(SLIDES)
              .set({ position: slide.position })
              .where(eq(SLIDES.id, slide.id));
          }

          if (slide.type === 'image') {
            if (slide.imageModified) {
              const imageFile = formData.get(`slides.${slide.id}.file`);
              let mediaUrl = null;
              if (imageFile) {
                mediaUrl = await uploadImage(imageFile);
              }

              await trx
                .update(SLIDE_CONTENT)
                .set({
                  media_url: mediaUrl,
                  description: slide.content.description
                })
                .where(eq(SLIDE_CONTENT.slide_id, slide.id));
            } else if (slide.descriptionModified) {
              await trx
                .update(SLIDE_CONTENT)
                .set({ description: slide.content.description })
                .where(eq(SLIDE_CONTENT.slide_id, slide.id));
            }
          } else if (slide.type === 'chat') {
            if (slide.contentModified || slide.pdfModified) {
              // Delete existing chat messages
              await trx
                .delete(CHAT_MESSAGES)
                .where(eq(CHAT_MESSAGES.slide_id, slide.id));

              // Process new chat content
              await processChat(trx, slide, slide.id, formData);
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Episode updated successfully'
    });

  } catch (error) {
    console.error('Error updating episode:', error);
    return NextResponse.json(
      { error: 'Failed to update episode', details: error.message },
      { status: 500 }
    );
  }
}

