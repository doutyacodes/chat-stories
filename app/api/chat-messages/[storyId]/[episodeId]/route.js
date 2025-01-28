import { NextResponse } from 'next/server';
import { 
  CHAT_MESSAGES, 
  CHARACTERS, 
  STORIES, 
  EPISODES, 
  SLIDE_CONTENT
} from '@/utils/schema';
import { db } from '@/utils';
import { eq, and } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { storyId, episodeId } = params;

  try {
    // Fetch chat messages with character details
    // const chatMessages = await db
    //   .select({
    //     id: CHAT_MESSAGES.id,
    //     message: CHAT_MESSAGES.message,
    //     sequence: CHAT_MESSAGES.sequence,
    //     character: {
    //       id: CHARACTERS.id,
    //       name: CHARACTERS.name,
    //       is_sender: CHARACTERS.is_sender
    //     }
    //   })
    //   .from(CHAT_MESSAGES)
    //   .leftJoin(CHARACTERS, eq(CHARACTERS.id, CHAT_MESSAGES.character_id))
    //   .where(
    //     and(
    //       eq(CHAT_MESSAGES.story_id, storyId),
    //       eq(CHAT_MESSAGES.episode_id, episodeId)
    //     )
    //   )
    //   .orderBy(CHAT_MESSAGES.sequence);

    const chatMessages = await db
      .select({
        id: CHAT_MESSAGES.id,
        message: CHAT_MESSAGES.message,
        sequence: CHAT_MESSAGES.sequence,
        character: {
          id: CHARACTERS.id,
          name: CHARACTERS.name,
          is_sender: CHARACTERS.is_sender,
        },
        audio_url: SLIDE_CONTENT.audio_url, // Fetch audio URL from SLIDE_CONTENT
      })
      .from(CHAT_MESSAGES)
      .leftJoin(CHARACTERS, eq(CHARACTERS.id, CHAT_MESSAGES.character_id))
      .leftJoin(
        SLIDE_CONTENT,
        and(
          eq(SLIDE_CONTENT.chat_story_id, CHAT_MESSAGES.id), // Link chat_story_id
          eq(SLIDE_CONTENT.slide_id, storyId) // Use storyId for the slide relationship
        )
      )
      .where(
        and(
          eq(CHAT_MESSAGES.story_id, storyId),
          eq(CHAT_MESSAGES.episode_id, episodeId)
        )
      )
      .orderBy(CHAT_MESSAGES.sequence);

    return NextResponse.json(chatMessages);
  } catch (error) {
    console.error('Chat Messages Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}
