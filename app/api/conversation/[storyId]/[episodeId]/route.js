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
import { eq, and, isNotNull, or } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { storyId, episodeId } = params;
  const { searchParams } = new URL(request.url);
  const slideId = searchParams.get("slideId");

  try {
    // First check if we have any messages with slide_id = 0 for this story/episode
    const oldFormatMessages = await db
    .select({
      id: CHAT_MESSAGES.id
    })
    .from(CHAT_MESSAGES)
    .where(
      and(
        eq(CHAT_MESSAGES.story_id, storyId),
        eq(CHAT_MESSAGES.episode_id, episodeId),
        eq(CHAT_MESSAGES.slide_id, 0)
      )
    )
    .limit(1);

    let conversation;
    let audioMediaData;

    // If we found messages with slide_id = 0, use the old format query
    if (oldFormatMessages.length > 0) {
    conversation = await db
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

    // Get audio using story_id and episode_id
    audioMediaData = await db
    .select({
        audio_url: SLIDE_CONTENT.audio_url,
        media_url: SLIDE_CONTENT.media_url, // Fetching media_url
    })
      .from(SLIDE_CONTENT)
      .leftJoin(SLIDES, eq(SLIDE_CONTENT.slide_id, SLIDES.id))
      .where(
        and(
          eq(SLIDES.story_id, storyId),
          eq(SLIDES.episode_id, episodeId),
          or(
            isNotNull(SLIDE_CONTENT.audio_url),
            isNotNull(SLIDE_CONTENT.media_url) // Ensuring at least one is not null
        )        
      )
      )
      .limit(1);

  } else {   
    // Use the new format with slide_id
    conversation = await db
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
        .where(eq(CHAT_MESSAGES.slide_id, slideId))
        .orderBy(CHAT_MESSAGES.sequence);

    // Get audio and media using slide_id
    audioMediaData = await db
    .select({
        audio_url: SLIDE_CONTENT.audio_url,
        media_url: SLIDE_CONTENT.media_url, // Fetching media_url
    })
    .from(SLIDE_CONTENT)
    .where(
        and(
            eq(SLIDE_CONTENT.slide_id, slideId),
            or(
                isNotNull(SLIDE_CONTENT.audio_url),
                isNotNull(SLIDE_CONTENT.media_url) // Ensuring at least one is not null
            )
        )
    )
    .limit(1);
  }
    // Extract values from the result
    const audioUrl = audioMediaData.length > 0 ? audioMediaData[0].audio_url : null;
    const mediaUrl = audioMediaData.length > 0 ? audioMediaData[0].media_url : null;

    return NextResponse.json({
      audio_url: audioUrl,
      bgImage: mediaUrl,
      conversation,
    });
  } catch (error) {
    console.error('Chat Messages Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}