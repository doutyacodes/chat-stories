import { NextResponse } from 'next/server';
import { eq, and, desc, asc, like, inArray } from 'drizzle-orm';
import { db } from '@/utils';
import { STORY_LIKES, STORIES, CATEGORIES, TAGS, STORY_TAGS } from '@/utils/schema';
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

    const conditions = [eq(STORY_LIKES.user_id, userId)];

    if (type && type !== 'all') {
      conditions.push(eq(STORIES.story_type, type));
    }

    if (search.trim()) {
      conditions.push(like(STORIES.title, `%${search.trim()}%`));
    }

    const rawLiked = await db
      .select({
        like_id: STORY_LIKES.id,
        story_id: STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        cover_img: STORIES.cover_img,
        story_type: STORIES.story_type,
        category: CATEGORIES.name,
        liked_at: STORY_LIKES.created_at,
      })
      .from(STORY_LIKES)
      .innerJoin(STORIES, eq(STORY_LIKES.story_id, STORIES.id))
      .leftJoin(CATEGORIES, eq(STORIES.category_id, CATEGORIES.id))
      .where(and(...conditions))
      .orderBy(sort === 'asc' ? asc(STORY_LIKES.created_at) : desc(STORY_LIKES.created_at));

    const likedWithTags = await batchAttachTagsToStories(rawLiked);

    return NextResponse.json({ likedStories: likedWithTags }, { status: 200 });
  } catch (error) {
    console.error('Error fetching liked stories:', error);
    return NextResponse.json({ error: 'Failed to fetch liked stories' }, { status: 500 });
  }
}
