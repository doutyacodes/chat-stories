// app/api/stories/[storyId]/route.ts (update method added to the same file)
import { NextResponse } from 'next/server';
import Client from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { db } from '@/utils';
import { STORIES, CHARACTERS, EPISODES } from '@/utils/schema';

export async function PATCH(request, { params }) {
  const { storyId } = params;
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userId = authResult.decoded_Data.id;
  const localTempDir = os.tmpdir();

  try {
    const formData = await request.formData();
    const storyName = formData.get('storyName');
    const storySynopsis = formData.get('storySynopsis');
    const category = formData.get('category');
    const coverImage = formData.get('coverImage');
    const episodesList = JSON.parse(formData.get('episodes'));

    // Verify story ownership
    const existingStory = await db
      .select({ story_type: STORIES.story_type })
      .from(STORIES)
      .where(and(
        eq(STORIES.id, storyId),
        eq(STORIES.user_id, userId)
      ))
      .limit(1);

    if (existingStory.length === 0) {
      return NextResponse.json(
        { error: 'Story not found or unauthorized' }, 
        { status: 404 }
      );
    }
    const storyType = existingStory[0].story_type;

    const updateData = {
        title: storyName,
        synopsis: storySynopsis,
        category_id: parseInt(category)
      };

    // Handle cover image upload
    let fileName;
    if (coverImage && coverImage instanceof File) {
      fileName = `${Date.now()}-${storyName.replace(/\s+/g, '-')}.png`;
      updateData.cover_img = fileName;
    }

    // Update story
    await db
      .update(STORIES)
      .set(updateData)
      .where(eq(STORIES.id, storyId));

    // Update episodes
    if (episodesList && episodesList.length > 0) {
      // Delete existing episodes
      await db.delete(EPISODES).where(eq(EPISODES.story_id, storyId));

      // Insert new episodes
      const episodePromises = episodesList
        .filter((episode) => episode.name.trim())
        .map((episode, index) =>
          db.insert(EPISODES).values({
            story_id: storyId,
            name: episode.name.trim(),
            synopsis: episode.synopsis ? episode.synopsis.trim() : null,
            episode_number: index + 1,
          })
        );
      await Promise.all(episodePromises);
    }

    // Handle characters for chat stories
    if (storyType === 'chat') {
        const charactersData = formData.get('characters');
        if (charactersData) {
        const charactersList = JSON.parse(charactersData);
    
        // Fetch existing characters for the story
        const existingCharacters = await db
            .select()
            .from(CHARACTERS)
            .where(eq(CHARACTERS.story_id, storyId));
    
        // Map existing characters by name for easier comparison
        const existingCharacterMap = new Map(
            existingCharacters.map(char => [char.name, char])
        );
    
        // Filter and group characters into updates and inserts
        const charactersToUpdate = [];
        const charactersToInsert = [];
    
        for (const char of charactersList) {
            const trimmedName = char.name.trim();
            if (trimmedName) {
            if (existingCharacterMap.has(trimmedName)) {
                // Update existing character
                charactersToUpdate.push({
                id: existingCharacterMap.get(trimmedName).id,
                is_sender: char.is_sender,
                });
            } else {
                // Insert new character
                charactersToInsert.push({
                story_id: storyId,
                name: trimmedName,
                is_sender: char.is_sender,
                });
            }
            }
        }
    
        // Perform updates
        for (const char of charactersToUpdate) {
            await db
            .update(CHARACTERS)
            .set({ is_sender: char.is_sender })
            .where(eq(CHARACTERS.id, char.id));
        }
    
        // Perform inserts
        if (charactersToInsert.length > 0) {
            await db.insert(CHARACTERS).values(charactersToInsert);
        }
        }
    }

    // Handle image upload
    if (fileName && coverImage) {
      const sftp = new Client();
      await sftp.connect({
        host: '68.178.163.247',
        port: 22,
        username: 'devusr',
        password: 'Wowfyuser#123',
      });

      const localFilePath = path.join(localTempDir, fileName);
      const cPanelDirectory = '/home/devusr/public_html/testusr/images';

      if (!fs.existsSync(localTempDir)) {
        fs.mkdirSync(localTempDir, { recursive: true });
      }

      // Convert File object to base64
      const arrayBuffer = await coverImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(localFilePath, buffer);

      await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

      fs.unlinkSync(localFilePath);
      await sftp.end();
    }

    return NextResponse.json(
      { 
        message: 'Story updated successfully', 
        storyId 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}