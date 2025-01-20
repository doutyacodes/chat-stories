import { NextResponse } from 'next/server';
import { and, eq, desc, sql } from 'drizzle-orm';
import { CATEGORIES, STORIES, STORY_LIKES, STORY_VIEWS } from '@/utils/schema';
import { db } from '@/utils';

export async function GET(request, { params }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sort') || 'latest';

  try {
    // Base query structure
    const baseQuery = {
      story_id: STORIES.id,
      title: STORIES.title,
      cover_img: STORIES.cover_img,
      story_type: STORIES.story_type,
      created_at: STORIES.created_at,
    };

    // Add counting of views and likes based on sort
    if (sortBy === 'most_viewed') {
      baseQuery.views_count = sql`IFNULL(COUNT(DISTINCT ${STORY_VIEWS.id}), 0)`.as('views_count');
    }
    if (sortBy === 'most_liked') {
      baseQuery.likes_count = sql`IFNULL(COUNT(DISTINCT ${STORY_LIKES.id}), 0)`.as('likes_count');
    }

    let query = db
      .select(baseQuery)
      .from(STORIES)
      .where(
        and(
          eq(STORIES.category_id, Number(id)),
          eq(STORIES.is_published, true)
        )
      );

    // Add joins based on sort type
    if (sortBy === 'most_viewed') {
      query = query.leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id));
    }
    if (sortBy === 'most_liked') {
      query = query.leftJoin(STORY_LIKES, eq(STORIES.id, STORY_LIKES.story_id));
    }

    // Add group by for all fields when using aggregates
    if (sortBy === 'most_viewed' || sortBy === 'most_liked') {
      query = query.groupBy(STORIES.id, STORIES.title, STORIES.cover_img, STORIES.story_type, STORIES.created_at);
    }

    // Apply ordering based on sort parameter
    switch (sortBy) {
      case 'most_viewed':
        query = query.orderBy(sql`views_count DESC`);
        break;
      case 'most_liked':
        query = query.orderBy(sql`likes_count DESC`);
        break;
      default: // 'latest'
        query = query.orderBy(desc(STORIES.created_at));
    }

    const stories = await query;

    // Fetch category info
    const categoryInfo = await db
      .select({
        title: CATEGORIES.name,
        cover_img: CATEGORIES.image_url,
        description: CATEGORIES.description,
      })
      .from(CATEGORIES)
      .where(eq(CATEGORIES.id, Number(id)))
      .limit(1);

    return NextResponse.json({
      stories,
      categoryInfo: categoryInfo[0]
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}