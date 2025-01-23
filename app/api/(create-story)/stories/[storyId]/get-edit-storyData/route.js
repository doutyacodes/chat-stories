// app/api/stories/[storyId]/route.ts
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { CHARACTERS, EPISODES, STORIES } from '@/utils/schema';
import { db } from '@/utils';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(request, { params }) {

  const { storyId } = await params;

  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userId = authResult.decoded_Data.id;
console.log("story id , user id", storyId, userId);

  try {
    // Fetch story details with user verification
    const story = await db
      .select({
        id: STORIES.id,
        name: STORIES.title,
        synopsis: STORIES.synopsis,
        category_id: STORIES.category_id,
        story_type: STORIES.story_type,
        cover_image: STORIES.cover_img,
        is_published: STORIES.is_published
      })
      .from(STORIES)
      .where(and(
        eq(STORIES.id, storyId),
        eq(STORIES.user_id, userId)
      ))
      .limit(1);

    if (story.length === 0) {
      return NextResponse.json(
        { error: 'Story not found or unauthorized' }, 
        { status: 404 }
      );
    }

    // Fetch episodes
    const episodes = await db
      .select({
        id: EPISODES.id,
        name: EPISODES.name,
        synopsis: EPISODES.synopsis,
        episode_number: EPISODES.episode_number
      })
      .from(EPISODES)
      .where(eq(EPISODES.story_id, storyId))
      .orderBy(EPISODES.episode_number);

    // Fetch characters (only for chat stories)
    let characters = [];
    if (story[0].story_type === 'chat') {
      characters = await db
        .select({
          id: CHARACTERS.id,
          name: CHARACTERS.name,
          is_sender: CHARACTERS.is_sender
        })
        .from(CHARACTERS)
        .where(eq(CHARACTERS.story_id, storyId));
    }

    return NextResponse.json({
      ...story[0],
      episodes,
      characters
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching story details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story details' },
      { status: 500 }
    );
  }
}