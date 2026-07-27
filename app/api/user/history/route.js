import { NextResponse } from 'next/server';
import { eq, and, desc, asc, like, inArray } from 'drizzle-orm';
import { db } from '@/utils';
import { USER_LAST_READ, STORIES, CATEGORIES, TAGS, STORY_TAGS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';

export const dynamic = 'force-dynamic';

const batchAttachTagsToStories = async (storiesList) => {
  if (!storiesList || storiesList.length === 0) return [];
  const storyIds = storiesList.map((s) => s.story_id).filter(Boolean);
  if (storyIds.length === 0) return storiesList.map((s) => ({ ...s, tags: [] }));

  try {
    const allTags = await db
      .select({
        story_id: STORY_TAGS.story_id,
        name: TAGS.name,
      })
      .from(STORY_TAGS)
      .innerJoin(TAGS, eq(STORY_TAGS.tag_id, TAGS.id))
      .where(inArray(STORY_TAGS.story_id, storyIds));

    const tagsMap = {};
    allTags.forEach(({ story_id, name }) => {
      if (!tagsMap[story_id]) tagsMap[story_id] = [];
      tagsMap[story_id].push(name);
    });

    return storiesList.map((story) => ({
      ...story,
      tags: tagsMap[story.story_id] || [],
    }));
  } catch (e) {
    console.error('Error batch fetching tags:', e);
    return storiesList.map((s) => ({ ...s, tags: [] }));
  }
};

export async function GET(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    const userId = authResult.decoded_Data.id;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const sort = searchParams.get('sort') || 'desc';

    const conditions = [eq(USER_LAST_READ.user_id, userId)];

    if (type && type !== 'all') {
      conditions.push(eq(STORIES.story_type, type));
    }

    if (search.trim()) {
      conditions.push(like(STORIES.title, `%${search.trim()}%`));
    }

    const rawHistory = await db
      .select({
        history_id: USER_LAST_READ.id,
        story_id: STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        cover_img: STORIES.cover_img,
        story_type: STORIES.story_type,
        category: CATEGORIES.name,
        last_read_at: USER_LAST_READ.last_read_at,
      })
      .from(USER_LAST_READ)
      .innerJoin(STORIES, eq(USER_LAST_READ.story_id, STORIES.id))
      .leftJoin(CATEGORIES, eq(STORIES.category_id, CATEGORIES.id))
      .where(and(...conditions))
      .orderBy(sort === 'asc' ? asc(USER_LAST_READ.last_read_at) : desc(USER_LAST_READ.last_read_at));

    const historyWithTags = await batchAttachTagsToStories(rawHistory);

    return NextResponse.json({ history: historyWithTags }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    const userId = authResult.decoded_Data.id;

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('storyId');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      await db.delete(USER_LAST_READ).where(eq(USER_LAST_READ.user_id, userId));
      return NextResponse.json({ message: 'History cleared successfully' }, { status: 200 });
    }

    if (storyId) {
      await db
        .delete(USER_LAST_READ)
        .where(
          and(
            eq(USER_LAST_READ.user_id, userId),
            eq(USER_LAST_READ.story_id, parseInt(storyId))
          )
        );
      return NextResponse.json({ message: 'Item removed from history' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
}
