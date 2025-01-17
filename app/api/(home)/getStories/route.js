import { NextResponse } from 'next/server';
import { STORIES, CATEGORIES } from '../../../../utils/schema';
import { authenticate } from '../../../../lib/jwtMiddleware';
import { db } from '../../../../utils';
import { eq } from 'drizzle-orm';

export async function GET(request) {
  // const authResult = await authenticate(request);
  // if (!authResult.authenticated) {
  //   return authResult.response;
  // }

  try {
    const stories = await db
      .select({
        id: STORIES.id,
        title: STORIES.title,
        description: STORIES.synopsis,
        image: STORIES.cover_img,
        category_id: STORIES.category_id,
        category_name: CATEGORIES.name,
        story_type: STORIES.story_type
      })
      .from(STORIES)
      .leftJoin(CATEGORIES, eq(STORIES.category_id, CATEGORIES.id))
      .where(eq(STORIES.is_published, true))

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}