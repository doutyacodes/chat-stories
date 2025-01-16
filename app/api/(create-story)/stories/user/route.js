import { NextResponse } from 'next/server';
import {
  STORIES,
  CATEGORIES,
  EPISODES,
  CHARACTERS
} from '../../../../../utils/schema';
import { authenticate } from '../../../../../lib/jwtMiddleware';
import { db } from '../../../../../utils';
import { eq, count } from 'drizzle-orm';

export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch all stories with category and other details
    const stories = await db
      .select({
        id: STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        coverImage: STORIES.cover_img,
        category: CATEGORIES.name,
        type: STORIES.story_type,
        isPublished: STORIES.is_published,
        createdAt: STORIES.created_at,
        updatedAt: STORIES.updated_at,
      })
      .from(STORIES)
      .leftJoin(CATEGORIES, eq(STORIES.category_id, CATEGORIES.id));

    // For each story, fetch episode count and character count
    const storiesWithDetails = await Promise.all(
      stories.map(async (story) => {
        // Fetch episode count
        const episodeCountResult = await db
          .select({ count: count(EPISODES.id) })
          .from(EPISODES)
          .where(eq(EPISODES.story_id, story.id));

        const episodeCount = episodeCountResult[0]?.count ?? 0;

        // Fetch character count
        const characterCountResult = await db
          .select({ count: count(CHARACTERS.id) })
          .from(CHARACTERS)
          .where(eq(CHARACTERS.story_id, story.id));

        const characterCount = characterCountResult[0]?.count ?? 0;

        return {
          ...story,
          episodeCount,
          characterCount,
        };
      })
    );

    // Return the data in the required format
    return NextResponse.json(
      { stories: storiesWithDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: 'Failed to fetch stories. Please try again.' },
      { status: 500 }
    );
  }
}