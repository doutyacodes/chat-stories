import { NextResponse } from 'next/server';
import { 
  CHAT_MESSAGES, 
  CHARACTERS, 
  STORIES, 
  EPISODES, 
  SLIDE_CONTENT,
  SLIDES
} from '@/utils/schema';
import { db } from '@/utils';
import { eq, and, isNotNull } from 'drizzle-orm';

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

    // const chatMessages = await db
    //   .select({
    //     id: CHAT_MESSAGES.id,
    //     message: CHAT_MESSAGES.message,
    //     sequence: CHAT_MESSAGES.sequence,
    //     character: {
    //       id: CHARACTERS.id,
    //       name: CHARACTERS.name,
    //       is_sender: CHARACTERS.is_sender,
    //     },
    //     audio_url: SLIDE_CONTENT.audio_url, // Fetch audio URL from SLIDE_CONTENT
    //   })
    //   .from(CHAT_MESSAGES)
    //   .leftJoin(CHARACTERS, eq(CHARACTERS.id, CHAT_MESSAGES.character_id))
    //   .leftJoin(
    //     SLIDE_CONTENT,
    //     and(
    //       eq(SLIDE_CONTENT.chat_story_id, CHAT_MESSAGES.id), // Link chat_story_id
    //       eq(SLIDE_CONTENT.slide_id, storyId) // Use storyId for the slide relationship
    //     )
    //   )
    //   .where(
    //     and(
    //       eq(CHAT_MESSAGES.story_id, storyId),
    //       eq(CHAT_MESSAGES.episode_id, episodeId)
    //     )
    //   )
    //   .orderBy(CHAT_MESSAGES.sequence);

   // Fetch chat messages
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
      })
      .from(CHAT_MESSAGES)
      .leftJoin(CHARACTERS, eq(CHARACTERS.id, CHAT_MESSAGES.character_id))
      .where(
        and(
          eq(CHAT_MESSAGES.story_id, storyId),
          eq(CHAT_MESSAGES.episode_id, episodeId)
        )
      )
      .orderBy(CHAT_MESSAGES.sequence);

      // Fetch the audio URL separately (Get first valid audio_url)
      const audioData = await db
      .select({
        audio_url: SLIDE_CONTENT.audio_url,
      })
      .from(SLIDE_CONTENT)
      .leftJoin(SLIDES, eq(SLIDE_CONTENT.slide_id, SLIDES.id))
      .where(
        and(
          eq(SLIDES.story_id, storyId),
          eq(SLIDES.episode_id, episodeId),
          isNotNull(SLIDE_CONTENT.audio_url) // Ensure audio_url is not null
        )
      )
      .limit(1); // Get only one audio URL

      const audioUrl = audioData.length > 0 ? audioData[0].audio_url : null;

      // Return chat messages with a single audio URL
      return NextResponse.json({
      audio_url: audioUrl, // Send only one audio URL
      chatMessages,
      });
  } catch (error) {
    console.error('Chat Messages Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}
