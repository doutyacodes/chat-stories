import { NextResponse } from 'next/server';
import { STORIES, CHARACTERS, EPISODES } from '../../../../utils/schema';
// import SFTPClient from 'ssh2-sftp-client';
import Client from 'ssh2-sftp-client';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { authenticate } from '../../../../lib/jwtMiddleware';
import { db } from '../../../../utils';
import { eq } from 'drizzle-orm';

export async function POST(request) {
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
    const charactersList = JSON.parse(formData.get('characters'));
    const episodesList = JSON.parse(formData.get('episodes'));
    
    // Generate unique filename for cover image
    const fileName = `${Date.now()}-${storyName.replace(/\s+/g, '-')}.png`;

    // Save story in database
    const storyRecord = await db.insert(STORIES).values({
      title: storyName,
      synopsis: storySynopsis,
      category_id: parseInt(category),
      story_type: 'chat',
      user_id: userId,
      cover_img: fileName,
    });

    const storyId = storyRecord[0].insertId;

    // Save characters
    const characterPromises = charactersList
      .filter(char => char.name.trim()) // Filter out any entries with empty names
      .map(char => 
        db.insert(CHARACTERS).values({
          story_id: storyId,
          name: char.name.trim(), // Insert the name
          is_sender: char.is_sender, // Insert the is_sender value
        })
      );
    await Promise.all(characterPromises);

    // Save episodes if provided
    let savedEpisodes = [];
    if (episodesList && episodesList.length > 0) {
      const episodePromises = episodesList
        .filter((episode) => episode.name.trim()) // Ensure non-empty episode names
        .map((episode) =>
          db.insert(EPISODES).values({
            story_id: storyId,
            name: episode.name.trim(),
            synopsis: episode.synopsis ? episode.synopsis.trim() : null,
            episode_number: episodesList.indexOf(episode) + 1, // Generate episode number
          })
        );
      await Promise.all(episodePromises);

      // Fetch saved episodes with IDs
      savedEpisodes = await db
        .select({
          id: EPISODES.id,
          name: EPISODES.name,
          synopsis: EPISODES.synopsis,
          episode_number: EPISODES.episode_number,
        })
        .from(EPISODES)
        .where(eq(EPISODES.story_id, storyId));
    }
  
    // Fetch saved characters with IDs
    const savedCharacters = await db
    .select({ id: CHARACTERS.id, name: CHARACTERS.name })
    .from(CHARACTERS)
    .where(eq(CHARACTERS.story_id, storyId));

    // Handle image upload
    if (coverImage) {
      // const sftp = new SFTPClient();
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

      // Update story with cover image URL
      // await db
      //   .update(STORIES)
      //   .set({ cover_img: fileName })
      //   .where(eq(STORIES.id, storyId));
    }

    return NextResponse.json(
      {
        message: 'Story created successfully',
        storyId,
        characters: savedCharacters,
        episodes: savedEpisodes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}