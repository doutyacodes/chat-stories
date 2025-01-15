// app/api/stories/[id]/chat/route.js
import { NextResponse } from 'next/server';
import { 
  STORIES, 
  EPISODES, 
  CHAT_MESSAGES,
  CHARACTERS 
} from '../../../../../utils/schema';
import { authenticate } from '../../../../../lib/jwtMiddleware';
import { db } from '../../../../../utils';
import { eq, and } from 'drizzle-orm';

export async function GET(request, { params }) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const { storyId } = await params
    console.log("log", storyId);

  try {
    // Fetch story details
    const story = await db
      .select({
        id: STORIES.id,
        title: STORIES.title,
        image: STORIES.cover_img,
        synopsis: STORIES.synopsis,
        category_id: STORIES.category_id
      })
      .from(STORIES)
      .where(eq(STORIES.id, storyId))
      .limit(1);

    if (!story || story.length === 0) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Fetch episodes for the story
    const episodes = await db
      .select({
        id: EPISODES.id,
        episode_number: EPISODES.episode_number,
        title: EPISODES.name
      })
      .from(EPISODES)
      .where(eq(EPISODES.story_id, storyId))
      .orderBy(EPISODES.episode_number);

    // Fetch characters for the story
    const characters = await db
      .select({
        id: CHARACTERS.id,
        name: CHARACTERS.name
      })
      .from(CHARACTERS)
      .where(eq(CHARACTERS.story_id, storyId));

    // Fetch messages for all episodes with character names
    const messages = await db
    .select({
      id: CHAT_MESSAGES.id,
      episode_id: CHAT_MESSAGES.episode_id,
      content: CHAT_MESSAGES.message,
      sender_name: CHARACTERS.name,  // Join to get the character's name
      is_sender: CHARACTERS.is_sender,  // Add is_sender field
      created_at: CHAT_MESSAGES.created_at,
    })
    .from(CHAT_MESSAGES)
    .leftJoin(CHARACTERS, eq(CHARACTERS.id, CHAT_MESSAGES.character_id))  // Assuming `sender_id` is the character ID in the messages
    .where(eq(CHAT_MESSAGES.story_id, storyId))
    .orderBy(CHAT_MESSAGES.created_at);

      // Add is_character as true for all messages temporarily
      // const messagesWithCharacterFlag = messages.map(message => ({
      //   ...message,
      //   is_character: true 
      // }));

    // Prepare episodes array
    let episodesWithMessages = episodes.map(episode => ({
      ...episode,
      messages: messages.filter(message => message.episode_id === episode.id)
    }));

  // Handle case where there are no episodes
    if (episodesWithMessages.length === 0) {
      episodesWithMessages = [
        {
          id: null, // No episode ID
          episode_number: null,
          title: "General Chat", // Placeholder title
          messages: messages // Attach all messages directly to this placeholder
        }
      ];
    }

    // Structure the response
    const storyData = {
      ...story[0],
      episodes: episodesWithMessages,
      characters
    };
    return NextResponse.json(storyData);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story data' },
      { status: 500 }
    );
  }
}