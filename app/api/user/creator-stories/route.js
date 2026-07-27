import { NextResponse } from 'next/server';
import { eq, and, desc, asc, like, sql, count } from 'drizzle-orm';
import { db } from '@/utils';
import { STORIES, CATEGORIES, STORY_VIEWS, STORY_LIKES, EPISODES } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    const userId = authResult.decoded_Data.id;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, published, draft
    const type = searchParams.get('type') || 'all'; // all, chat, game
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest, views_desc, likes_desc

    const conditions = [eq(STORIES.user_id, userId)];

    if (status === 'published') {
      conditions.push(eq(STORIES.is_published, true));
    } else if (status === 'draft') {
      conditions.push(eq(STORIES.is_published, false));
    }

    if (type !== 'all') {
      conditions.push(eq(STORIES.story_type, type));
    }

    if (search.trim()) {
      conditions.push(like(STORIES.title, `%${search.trim()}%`));
    }

    // Build query with LEFT JOINs for aggregated view and like counts per story
    const baseQuery = db
      .select({
        id: STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        cover_img: STORIES.cover_img,
        story_type: STORIES.story_type,
        category: CATEGORIES.name,
        is_published: STORIES.is_published,
        created_at: STORIES.created_at,
        updated_at: STORIES.updated_at,
        views_count: sql`IFNULL(COUNT(DISTINCT ${STORY_VIEWS.id}), 0)`.as('views_count'),
        likes_count: sql`IFNULL(COUNT(DISTINCT ${STORY_LIKES.id}), 0)`.as('likes_count'),
      })
      .from(STORIES)
      .leftJoin(CATEGORIES, eq(STORIES.category_id, CATEGORIES.id))
      .leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id))
      .leftJoin(STORY_LIKES, eq(STORIES.id, STORY_LIKES.story_id))
      .where(and(...conditions))
      .groupBy(
        STORIES.id,
        STORIES.title,
        STORIES.synopsis,
        STORIES.cover_img,
        STORIES.story_type,
        CATEGORIES.name,
        STORIES.is_published,
        STORIES.created_at,
        STORIES.updated_at
      );

    let orderByClause;
    switch (sort) {
      case 'oldest':
        orderByClause = asc(STORIES.created_at);
        break;
      case 'views_desc':
        orderByClause = desc(sql`views_count`);
        break;
      case 'likes_desc':
        orderByClause = desc(sql`likes_count`);
        break;
      case 'newest':
      default:
        orderByClause = desc(STORIES.created_at);
        break;
    }

    const stories = await baseQuery.orderBy(orderByClause);

    // Fetch episode counts for each story
    const storiesWithEpisodeCount = await Promise.all(
      stories.map(async (story) => {
        const [epRes] = await db
          .select({ count: count() })
          .from(EPISODES)
          .where(eq(EPISODES.story_id, story.id));

        return {
          ...story,
          views_count: Number(story.views_count) || 0,
          likes_count: Number(story.likes_count) || 0,
          episodes_count: epRes?.count || 0,
        };
      })
    );

    return NextResponse.json({ stories: storiesWithEpisodeCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching creator stories:', error);
    return NextResponse.json({ error: 'Failed to fetch creator stories' }, { status: 500 });
  }
}
