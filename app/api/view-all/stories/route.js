import { NextResponse } from 'next/server';
import { and, eq, desc, sql, like, or } from 'drizzle-orm';
import { CATEGORIES, STORIES, STORY_LIKES, STORY_VIEWS } from '@/utils/schema';
import { db } from '@/utils';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sort') || 'latest';
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const storyType = searchParams.get('type') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  try {
    const whereConditions = and(
      eq(STORIES.is_published, true),
      category !== 'all' ? eq(STORIES.category_id, Number(category)) : undefined,
      storyType ? eq(STORIES.story_type, storyType) : undefined,
      search ? 
        or(
          like(STORIES.title, `%${search}%`),
          like(STORIES.synopsis, `%${search}%`)
        ) 
      : undefined
    );

    const baseQuery = {
      story_id: STORIES.id,
      title: STORIES.title,
      cover_img: STORIES.cover_img,
      story_type: STORIES.story_type,
      age_rating: STORIES.age_rating,
      created_at: STORIES.created_at,
    };

    if (sortBy === 'most_viewed') {
      baseQuery.views_count = sql`IFNULL(COUNT(DISTINCT ${STORY_VIEWS.id}), 0)`.as('views_count');
    }
    if (sortBy === 'most_liked') {
      baseQuery.likes_count = sql`IFNULL(COUNT(DISTINCT ${STORY_LIKES.id}), 0)`.as('likes_count');
    }

    let query = db
      .select(baseQuery)
      .from(STORIES)
      .where(whereConditions);

    if (sortBy === 'most_viewed') {
      query = query.leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id));
    }
    if (sortBy === 'most_liked') {
      query = query.leftJoin(STORY_LIKES, eq(STORIES.id, STORY_LIKES.story_id));
    }

    if (sortBy === 'most_viewed' || sortBy === 'most_liked') {
      query = query.groupBy(
        STORIES.id, 
        STORIES.title, 
        STORIES.cover_img, 
        STORIES.story_type, 
        STORIES.age_rating,
        STORIES.created_at
      );
    }

    switch (sortBy) {
      case 'most_viewed':
        query = query.orderBy(sql`views_count DESC`);
        break;
      case 'most_liked':
        query = query.orderBy(sql`likes_count DESC`);
        break;
      default:
        query = query.orderBy(desc(STORIES.created_at));
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const rawStories = await query;
    const storyIds = rawStories.map(s => s.story_id).filter(Boolean);

    let tagsMap = {};
    if (storyIds.length > 0) {
      const { TAGS, STORY_TAGS } = await import('@/utils/schema');
      const { inArray } = await import('drizzle-orm');
      const allTags = await db
        .select({
          story_id: STORY_TAGS.story_id,
          name: TAGS.name
        })
        .from(STORY_TAGS)
        .innerJoin(TAGS, eq(STORY_TAGS.tag_id, TAGS.id))
        .where(inArray(STORY_TAGS.story_id, storyIds));

      allTags.forEach(({ story_id, name }) => {
        if (!tagsMap[story_id]) tagsMap[story_id] = [];
        tagsMap[story_id].push(name);
      });
    }

    const stories = rawStories.map(story => ({
      ...story,
      genres: tagsMap[story.story_id] || []
    }));

    const hasMore = stories.length === limit;

    return NextResponse.json({ stories, page, limit, hasMore });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}