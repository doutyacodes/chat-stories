/**
 * GET /api/chat-messages/{storyId}/{episodeId}?slideId={slideId}
 *
 * This API fetches chat messages and the associated audio URL for a given story.
 * 
 * 🚀 How it Works:
 * - If `slideId` is provided (new stories), we use `slideId` to fetch data.
 * - If `slideId` is NOT provided (older stories), we fallback to `storyId` and `episodeId`.
 * - This ensures backward compatibility while supporting the new data structure.
 *
 * 🔍 Query Priorities:
 * 1️⃣ If `slideId` exists → Use it to fetch both chat messages & audio.
 * 2️⃣ If `slideId` is missing → Use `storyId` & `episodeId` instead.
 *
 * 📌 Important:
 * - Older stories don’t have `slideId` (it’s NULL), so they will use the old method.
 * - New stories will always have `slideId`, so we avoid unnecessary queries.
 */


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
  const { searchParams } = new URL(request.url);
  const slideId = searchParams.get("slideId"); // Get slideId from query params

  try {
 
  //  // Fetch chat messages
  //     const chatMessages = await db
  //     .select({
  //       id: CHAT_MESSAGES.id,
  //       message: CHAT_MESSAGES.message,
  //       sequence: CHAT_MESSAGES.sequence,
  //       character: {
  //         id: CHARACTERS.id,
  //         name: CHARACTERS.name,
  //         is_sender: CHARACTERS.is_sender,
  //       },
  //     })
  //     .from(CHAT_MESSAGES)
  //     .leftJoin(CHARACTERS, eq(CHARACTERS.id, CHAT_MESSAGES.character_id))
  //     .where(
  //       and(
  //         eq(CHAT_MESSAGES.story_id, storyId),
  //         eq(CHAT_MESSAGES.episode_id, episodeId)
  //       )
  //     )
  //     .orderBy(CHAT_MESSAGES.sequence);

  //     // Fetch the audio URL separately (Get first valid audio_url)
  //     const audioData = await db
  //     .select({
  //       audio_url: SLIDE_CONTENT.audio_url,
  //     })
  //     .from(SLIDE_CONTENT)
  //     .leftJoin(SLIDES, eq(SLIDE_CONTENT.slide_id, SLIDES.id))
  //     .where(
  //       and(
  //         eq(SLIDES.story_id, storyId),
  //         eq(SLIDES.episode_id, episodeId),
  //         isNotNull(SLIDE_CONTENT.audio_url) // Ensure audio_url is not null
  //       )
  //     )
  //     .limit(1); // Get only one audio URL

  //     const audioUrl = audioData.length > 0 ? audioData[0].audio_url : null;


  let chatMessages;

  if (slideId) {
    // Fetch chat messages using slide_id
    chatMessages = await db
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
  } else {
    // Fallback: Fetch chat messages using storyId & episodeId (for older stories)
    chatMessages = await db
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
        and(eq(CHAT_MESSAGES.story_id, storyId), eq(CHAT_MESSAGES.episode_id, episodeId))
      )
      .orderBy(CHAT_MESSAGES.sequence);
  }

      // Fetch the audio URL using the same logic (slide_id if available, else story_id & episode_id)
      let audioData;

      if (slideId) {
        audioData = await db
          .select({
            audio_url: SLIDE_CONTENT.audio_url,
          })
          .from(SLIDE_CONTENT)
          .leftJoin(SLIDES, eq(SLIDE_CONTENT.slide_id, SLIDES.id))
          .where(
            and(
              eq(SLIDE_CONTENT.slide_id, slideId),
              isNotNull(SLIDE_CONTENT.audio_url)
            )
          )
          .limit(1);
      } else {
        audioData = await db
          .select({
            audio_url: SLIDE_CONTENT.audio_url,
          })
          .from(SLIDE_CONTENT)
          .leftJoin(SLIDES, eq(SLIDE_CONTENT.slide_id, SLIDES.id))
          .where(
            and(
              eq(SLIDES.story_id, storyId),
              eq(SLIDES.episode_id, episodeId),
              isNotNull(SLIDE_CONTENT.audio_url)
            )
          )
          .limit(1);
      }

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
