import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { STORIES, CATEGORIES, STORY_VIEWS, STORY_LIKES } from '@/utils/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { type } = params;
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sort') || 'latest';

  try {
    let stories;
    let categoryInfo = null;

    if (type === 'trending' || type === 'latest') {
      // Base query structure for both trending and latest
      const baseQuery = {
        story_id: STORIES.id,
        title: STORIES.title,
        cover_img: STORIES.cover_img,
        story_type: STORIES.story_type,
        age_rating: STORIES.age_rating,
        created_at: STORIES.created_at,
      };

      // Add counting of views and likes
      if (sortBy === 'most_viewed' || type === 'trending') {
        baseQuery.views_count = sql`IFNULL(COUNT(DISTINCT ${STORY_VIEWS.id}), 0)`.as('views_count');
      }
      if (sortBy === 'most_liked') {
        baseQuery.likes_count = sql`IFNULL(COUNT(DISTINCT ${STORY_LIKES.id}), 0)`.as('likes_count');
      }

      let query = db
        .select(baseQuery)
        .from(STORIES)
        .where(eq(STORIES.is_published, true));

      // Add joins based on sort type
      if (sortBy === 'most_viewed' || type === 'trending') {
        query = query.leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id));
      }
      if (sortBy === 'most_liked') {
        query = query.leftJoin(STORY_LIKES, eq(STORIES.id, STORY_LIKES.story_id));
      }

      // Add group by for all fields when using aggregates
      if (sortBy === 'most_viewed' || sortBy === 'most_liked' || type === 'trending') {
        query = query.groupBy(STORIES.id, STORIES.title, STORIES.cover_img, STORIES.story_type, STORIES.age_rating, STORIES.created_at);
      }

      // Apply specific conditions and ordering based on type and sort
      if (type === 'trending') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.where(and(
          gte(STORIES.created_at, sevenDaysAgo),
          eq(STORIES.is_published, true)
        ))
        query = query.orderBy(sql`views_count DESC`);
      } else {
        // For 'latest' type with different sort options
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
      }

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

      stories = rawStories.map(story => ({
        ...story,
        genres: tagsMap[story.story_id] || []
      }));

      // Set category info for trending/latest
      categoryInfo = {
        title: type === 'trending' ? 'Trending Stories' : 'Latest Stories',
        cover_img: null,
        description: type === 'trending' 
          ? 'Most popular stories from the past week' 
          : 'Recently added stories'
      };
    }

    return NextResponse.json({
      stories,
      categoryInfo
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}