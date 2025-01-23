// import { NextResponse } from 'next/server';
// import { EPISODES, STORIES, CHAT_MESSAGES, CHARACTERS } from '../../../../../utils/schema';
// import { db } from '../../../../../utils';
// import { eq } from 'drizzle-orm';

// export async function GET(request, { params }) {
//   const { id: episodeId } = params; // Extract `episodeId` from the route parameter

//   try {
//     // Fetch episode details
//     const episode = await db
//       .select({
//         id: EPISODES.id,
//         episode_number: EPISODES.episode_number,
//         title: EPISODES.name,
//         synopsis: EPISODES.synopsis,
//         story_id: EPISODES.story_id,
//       })
//       .from(EPISODES)
//       .where(eq(EPISODES.id, episodeId))
//       .limit(1);

//     if (!episode || episode.length === 0) {
//       return NextResponse.json(
//         { error: 'Episode not found' },
//         { status: 404 }
//       );
//     }

//     const episodeData = episode[0];

//     // Fetch story details for the episode
//     const story = await db
//       .select({
//         id: STORIES.id,
//         title: STORIES.title,
//         image_url: STORIES.cover_img,
//         synopsis: STORIES.synopsis,
//       })
//       .from(STORIES)
//       .where(eq(STORIES.id, episodeData.story_id))
//       .limit(1);

//     if (!story || story.length === 0) {
//       return NextResponse.json(
//         { error: 'Story not found' },
//         { status: 404 }
//       );
//     }

//     const storyData = {
//       ...story[0],
//       is_online: true, // Adding `is_online` as true
//     };

//     // Fetch messages for the episode
//     const messages = await db
//       .select({
//         id: CHAT_MESSAGES.id,
//         content: CHAT_MESSAGES.message,
//         sender_name: CHARACTERS.name, // Get sender's name
//         is_sender: CHARACTERS.is_sender, // Whether the sender is the character
//         timestamp: CHAT_MESSAGES.created_at, // Message timestamp
//       })
//       .from(CHAT_MESSAGES)
//       .leftJoin(CHARACTERS, eq(CHARACTERS.id, CHAT_MESSAGES.character_id)) // Join with characters to get sender details
//       .where(eq(CHAT_MESSAGES.episode_id, episodeId))
//       .orderBy(CHAT_MESSAGES.created_at);

//     // Prepare the final response structure
//     const responseData = {
//       id: episodeData.id,
//       episode_number: episodeData.episode_number,
//       title: episodeData.title,
//       story: storyData,
//       messages,
//     };

//     return NextResponse.json(responseData);
//   } catch (error) {
//     console.error('Error fetching episode data:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch episode data' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { EPISODES, STORIES, CHAT_MESSAGES, CHARACTERS, EPISODE_DETAILS } from '../../../../../utils/schema';
import { db } from '../../../../../utils';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { id: episodeId } = params; // Extract `episodeId` from the route parameter

  try {
    // Fetch episode details
    const episode = await db
      .select({
        id: EPISODES.id,
        episode_number: EPISODES.episode_number,
        title: EPISODES.name,
        synopsis: EPISODES.synopsis,
        story_id: EPISODES.story_id,
      })
      .from(EPISODES)
      .where(eq(EPISODES.id, episodeId))
      .limit(1);

    if (!episode || episode.length === 0) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    const episodeData = episode[0];

    // Fetch story details for the episode
    const story = await db
      .select({
        id: STORIES.id,
        title: STORIES.title,
        image_url: STORIES.cover_img,
        synopsis: STORIES.synopsis,
      })
      .from(STORIES)
      .where(eq(STORIES.id, episodeData.story_id))
      .limit(1);

    if (!story || story.length === 0) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const storyData = {
      ...story[0],
      is_online: true, // Adding `is_online` as true
    };

    // Fetch messages for the episode
    const messages = await db
      .select({
        id: CHAT_MESSAGES.id,
        content: CHAT_MESSAGES.message,
        sender_name: CHARACTERS.name, // Get sender's name
        is_sender: CHARACTERS.is_sender, // Whether the sender is the character
        timestamp: CHAT_MESSAGES.created_at, // Message timestamp
      })
      .from(CHAT_MESSAGES)
      .leftJoin(CHARACTERS, eq(CHARACTERS.id, CHAT_MESSAGES.character_id)) // Join with characters to get sender details
      .where(eq(CHAT_MESSAGES.episode_id, episodeId))
      .orderBy(CHAT_MESSAGES.created_at);

    // Fetch episode details
    const details = await db
      .select({
        media_type: EPISODE_DETAILS.media_type,
        media_url: EPISODE_DETAILS.media_url,
        description: EPISODE_DETAILS.description,
        order: EPISODE_DETAILS.order,
      })
      .from(EPISODE_DETAILS)
      .where(eq(EPISODE_DETAILS.episode_id, episodeId))
      .orderBy(asc(EPISODE_DETAILS.order));

    // Fetch the next episode
    const nextEpisode = await db
      .select({
        id: EPISODES.id,
        title: EPISODES.name,
      })
      .from(EPISODES)
      .where(
        and(
          eq(EPISODES.story_id, episodeData.story_id),
          asc(EPISODES.episode_number)
        )
      )
      .where(eq(EPISODES.episode_number, episodeData.episode_number + 1))
      .limit(1);

    const nextEpisodeData = nextEpisode.length > 0 ? nextEpisode[0] : null;

    // Prepare the final response structure
    const responseData = {
      id: episodeData.id,
      episode_number: episodeData.episode_number,
      title: episodeData.title,
      story: storyData,
      messages,
      details: details.length > 0 ? details : undefined, // Include only if details exist
      nextEpisode: nextEpisodeData || undefined, // Include only if next episode exists
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching episode data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episode data' },
      { status: 500 }
    );
  }
}

