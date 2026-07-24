import { NextResponse } from 'next/server';
import {
  STORIES,
  STORY_VIEWS,
  CATEGORIES,
  USER_LAST_READ,
  TAGS,
  STORY_TAGS
} from '../../../../utils/schema';
import { db } from '../../../../utils';
import { eq, gte, and, sql, desc, inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const batchAttachTagsToStories = async (storiesList) => {
  if (!storiesList || storiesList.length === 0) return [];
  const storyIds = storiesList.map(s => s.story_id).filter(Boolean);
  if (storyIds.length === 0) return storiesList.map(s => ({ ...s, tags: [] }));

  try {
    const allTags = await db
      .select({
        story_id: STORY_TAGS.story_id,
        name: TAGS.name
      })
      .from(STORY_TAGS)
      .innerJoin(TAGS, eq(STORY_TAGS.tag_id, TAGS.id))
      .where(inArray(STORY_TAGS.story_id, storyIds));

    const tagsMap = {};
    allTags.forEach(({ story_id, name }) => {
      if (!tagsMap[story_id]) tagsMap[story_id] = [];
      tagsMap[story_id].push(name);
    });

    return storiesList.map(story => ({
      ...story,
      tags: tagsMap[story.story_id] || []
    }));
  } catch (e) {
    console.error('Error batch fetching tags:', e);
    return storiesList.map(s => ({ ...s, tags: [] }));
  }
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const categoryId = searchParams.get('categoryId');
    const session_id = searchParams.get('session_id');

    const authHeader = request.headers.get('Authorization');
    let user_id = null;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_id = decoded.id;
      } catch (error) {
        // Token optional
      }
    }

    const userCondition = user_id 
      ? eq(USER_LAST_READ.user_id, parseInt(user_id))
      : eq(USER_LAST_READ.session_id, session_id);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (section === 'continue-reading') {
      const [continueReadingStories, continuePlayingGames] = await Promise.all([
        db.select({
          story_id: STORIES.id,
          title: STORIES.title,
          cover_img: STORIES.cover_img,
          story_type: STORIES.story_type,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
          last_read_at: USER_LAST_READ.last_read_at,
        })
        .from(USER_LAST_READ)
        .innerJoin(STORIES, eq(USER_LAST_READ.story_id, STORIES.id))
        .where(and(userCondition, eq(STORIES.is_published, true), eq(STORIES.story_type, 'chat')))
        .orderBy(desc(USER_LAST_READ.last_read_at))
        .limit(10),

        db.select({
          story_id: STORIES.id,
          title: STORIES.title,
          cover_img: STORIES.cover_img,
          story_type: STORIES.story_type,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
          last_read_at: USER_LAST_READ.last_read_at,
        })
        .from(USER_LAST_READ)
        .innerJoin(STORIES, eq(USER_LAST_READ.story_id, STORIES.id))
        .where(and(userCondition, eq(STORIES.is_published, true), eq(STORIES.story_type, 'game')))
        .orderBy(desc(USER_LAST_READ.last_read_at))
        .limit(10)
      ]);

      const [storiesWithTags, gamesWithTags] = await Promise.all([
        batchAttachTagsToStories(continueReadingStories),
        batchAttachTagsToStories(continuePlayingGames)
      ]);

      const result = [];
      if (storiesWithTags.length > 0) {
        result.push({ id: 'continue-reading-story', title: 'Continue Reading Stories', data: storiesWithTags });
      }
      if (gamesWithTags.length > 0) {
        result.push({ id: 'continue-reading-game', title: 'Continue Reading Games', data: gamesWithTags });
      }

      return NextResponse.json({ categories: result });
    }

    if (section === 'trending') {
      const [trendingStories, trendingGames] = await Promise.all([
        db.select({
          story_id: STORIES.id,
          title: STORIES.title,
          cover_img: STORIES.cover_img,
          story_type: STORIES.story_type,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
          views_count: sql`IFNULL(COUNT(${STORY_VIEWS.id}), 0)`.as('views_count'),
        })
        .from(STORIES)
        .leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id))
        .where(and(gte(STORIES.created_at, sevenDaysAgo), eq(STORIES.is_published, true), eq(STORIES.story_type, 'chat')))
        .groupBy(STORIES.id, STORIES.title, STORIES.cover_img)
        .orderBy(sql`views_count DESC`),

        db.select({
          story_id: STORIES.id,
          title: STORIES.title,
          cover_img: STORIES.cover_img,
          story_type: STORIES.story_type,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
          views_count: sql`IFNULL(COUNT(${STORY_VIEWS.id}), 0)`.as('views_count'),
        })
        .from(STORIES)
        .leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id))
        .where(and(gte(STORIES.created_at, sevenDaysAgo), eq(STORIES.is_published, true), eq(STORIES.story_type, 'game')))
        .groupBy(STORIES.id, STORIES.title, STORIES.cover_img)
        .orderBy(sql`views_count DESC`)
      ]);

      const [storiesWithTags, gamesWithTags] = await Promise.all([
        batchAttachTagsToStories(trendingStories),
        batchAttachTagsToStories(trendingGames)
      ]);

      return NextResponse.json({
        categories: [
          { id: 'trendingstory', title: 'Trending Stories', data: storiesWithTags },
          { id: 'trendingGame', title: 'Trending Games', data: gamesWithTags }
        ]
      });
    }

    if (section === 'latest') {
      const [latestStories, latestGames] = await Promise.all([
        db.select({
          story_id: STORIES.id,
          title: STORIES.title,
          cover_img: STORIES.cover_img,
          story_type: STORIES.story_type,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
          created_at: STORIES.created_at,
        })
        .from(STORIES)
        .where(and(eq(STORIES.is_published, true), eq(STORIES.story_type, 'chat')))
        .orderBy(desc(STORIES.created_at))
        .limit(10),

        db.select({
          story_id: STORIES.id,
          title: STORIES.title,
          cover_img: STORIES.cover_img,
          story_type: STORIES.story_type,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
          created_at: STORIES.created_at,
        })
        .from(STORIES)
        .where(and(eq(STORIES.is_published, true), eq(STORIES.story_type, 'game')))
        .orderBy(desc(STORIES.created_at))
        .limit(10)
      ]);

      const [storiesWithTags, gamesWithTags] = await Promise.all([
        batchAttachTagsToStories(latestStories),
        batchAttachTagsToStories(latestGames)
      ]);

      return NextResponse.json({
        categories: [
          { id: 'latestStory', title: 'Latest Stories', data: storiesWithTags },
          { id: 'latestGame', title: 'Latest Games', data: gamesWithTags }
        ]
      });
    }

    if (section === 'categories-list') {
      const categoriesData = await db
        .select({
          id: CATEGORIES.id,
          title: CATEGORIES.name,
          description: CATEGORIES.description,
          image_url: CATEGORIES.image_url,
        })
        .from(CATEGORIES);

      return NextResponse.json({ categories: categoriesData });
    }

    if (section === 'category' && categoryId) {
      const parsedCatId = parseInt(categoryId);
      const catStories = await db
        .select({
          story_id: STORIES.id,
          title: STORIES.title,
          story_type: STORIES.story_type,
          cover_img: STORIES.cover_img,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
        })
        .from(STORIES)
        .where(and(eq(STORIES.category_id, parsedCatId), eq(STORIES.is_published, true)));

      const catStoriesWithTags = await batchAttachTagsToStories(catStories);
      return NextResponse.json({ data: catStoriesWithTags });
    }

    return NextResponse.json({ error: 'Invalid section parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
  }
}

