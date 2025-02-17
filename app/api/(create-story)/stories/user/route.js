import { NextResponse } from 'next/server';
import {
  STORIES,
  CATEGORIES,
  EPISODES,
  CHARACTERS,
  USERS
} from '../../../../../utils/schema';
import { authenticate } from '../../../../../lib/jwtMiddleware';
import { db } from '../../../../../utils';
import { eq, count, asc, desc } from 'drizzle-orm';


export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';


export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.id;

  // Get pagination and sorting parameters from URL
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page')) || 1;
  const sortOrder = url.searchParams.get('sortOrder') || 'desc';
  const limit = 9; // Items per page
  const offset = (page - 1) * limit;

  // First, get total count for pagination
  const totalCountResult = await db
  .select({ count: count() })
  .from(STORIES)
  .where(eq(STORIES.user_id, userId));

  const totalStories = totalCountResult[0].count;
  const totalPages = Math.ceil(totalStories / limit);


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
      .leftJoin(CATEGORIES, eq(STORIES.category_id, CATEGORIES.id))
      .where(eq(STORIES.user_id, userId))
      .orderBy(sortOrder === 'asc' ? asc(STORIES.created_at) : desc(STORIES.created_at))
      .limit(limit)
      .offset(offset);
      
    // // For each story, fetch episode count and character count
    // const storiesWithDetails = await Promise.all(
    //   stories.map(async (story) => {
    //     // Fetch episode count
    //     const episodeCountResult = await db
    //       .select({ count: count(EPISODES.id) })
    //       .from(EPISODES)
    //       .where(eq(EPISODES.story_id, story.id));

    //     const episodeCount = episodeCountResult[0]?.count ?? 0;

    //     // Fetch character count
    //     const characterCountResult = await db
    //       .select({ count: count(CHARACTERS.id) })
    //       .from(CHARACTERS)
    //       .where(eq(CHARACTERS.story_id, story.id));

    //     const characterCount = characterCountResult[0]?.count ?? 0;

    //     return {
    //       ...story,
    //       episodeCount,
    //       characterCount,
    //     };
    //   })
    // );

    // Return the data in the required format
    return NextResponse.json(
      { 
        stories: stories,
        pagination: {
          currentPage: page,
          totalPages,
          totalStories,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      },
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