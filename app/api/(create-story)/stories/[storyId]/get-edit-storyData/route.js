import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { CHARACTERS, EPISODES, STORIES, STORY_TAGS } from '@/utils/schema';
import { db } from '@/utils';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(request, { params }) {
  const { storyId } = await params;

  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userId = authResult.decoded_Data.id;

  try {
    const story = await db
      .select({
        id: STORIES.id,
        name: STORIES.title,
        synopsis: STORIES.synopsis,
        category_id: STORIES.category_id,
        storyType: STORIES.story_type,
        coverImagePath: STORIES.cover_img,
        trailerPath: STORIES.trailer,
        ageRating: STORIES.age_rating,
        language: STORIES.language,
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

    const tags = await db
      .select({ tag_id: STORY_TAGS.tag_id })
      .from(STORY_TAGS)
      .where(eq(STORY_TAGS.story_id, storyId));

    const tagIds = tags.map(t => t.tag_id);

    return NextResponse.json({
      ...story[0],
      tagIds,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching story details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story details' },
      { status: 500 }
    );
  }
}