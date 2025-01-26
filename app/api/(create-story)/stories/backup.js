import { NextResponse } from 'next/server';
import { STORIES, CHARACTERS, EPISODES } from '../../../../utils/schema';
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
    const hasEpisodes = JSON.parse(formData.get('hasEpisodes') || 'false'); 
    const episodesList = JSON.parse(formData.get('episodes') || '[]');
    const storyType = formData.get('storyType');

     // Only parse characters if it's a chat story
     let charactersList = [];
     if (storyType === 'chat' || storyType === 'interactive') {
       const charactersData = formData.get('characters');
       if (charactersData) {
         charactersList = JSON.parse(charactersData);
       }
     }

    // Generate unique filename for cover image
    const fileName = `${Date.now()}-${storyName.replace(/\s+/g, '-')}.png`;

    // Save story in database
    const storyRecord = await db.insert(STORIES).values({
      title: storyName,
      synopsis: storySynopsis,
      category_id: parseInt(category),
      story_type: storyType, // Supports 'chat', 'normal', and now 'interactive'
      user_id: userId,
      cover_img: fileName,
      is_published: false,
      has_episodes: hasEpisodes,
    });

    const storyId = storyRecord[0].insertId;

    // Save characters only for chat stories
    let savedCharacters = [];
    if (storyType === 'chat' || storyType === 'interactive' && charactersList.length > 0) {
      const characterPromises = charactersList
        .filter(char => char.name.trim()) // Filter out any entries with empty names
        .map(char => 
          db.insert(CHARACTERS).values({
            story_id: storyId,
            name: char.name.trim(),
            is_sender: char.is_sender,
          })
        );
      await Promise.all(characterPromises);
      // Fetch saved characters with IDs only for chat stories
      savedCharacters = await db
      .select({ id: CHARACTERS.id, name: CHARACTERS.name })
      .from(CHARACTERS)
      .where(eq(CHARACTERS.story_id, storyId));
    }

    // Save episodes if provided
    let savedEpisodes = [];
    if (!hasEpisodes) {
      // Create a default episode if no episodes are specified
      const defaultEpisodeName = `${storyName} - Full Story`;
      savedEpisodes = await db.insert(EPISODES).values({
        story_id: storyId,
        name: defaultEpisodeName,
        synopsis: storySynopsis,
        episode_number: 1,
      });
    } else if (episodesList && episodesList.length > 0) {
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
    }

    return NextResponse.json(
      {
        message: 'Story created successfully',
        storyId,
        ...(storyType === 'chat' && { characters: savedCharacters }), // Only include characters for chat stories
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