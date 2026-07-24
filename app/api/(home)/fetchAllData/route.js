import { NextResponse } from 'next/server';
import {
  CAROUSEL_STORIES,
  STORIES,
  STORY_VIEWS,
  CATEGORIES,
  USER_LAST_READ,
  TAGS,
  STORY_TAGS
} from '../../../../utils/schema';
import { db } from '../../../../utils';
import { eq, gte, and, or, isNull, sql, desc, inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper to batch populate story tags in a single DB query instead of N+1 queries
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
    const session_id = searchParams.get('session_id');

    const authHeader = request.headers.get('Authorization');
    let user_id = null;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_id = decoded.id;
      } catch (error) {
        console.error('Token Decoding Failed:', error);
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Run main database queries in parallel
    const userCondition = user_id 
      ? eq(USER_LAST_READ.user_id, parseInt(user_id))
      : eq(USER_LAST_READ.session_id, session_id);

    const [
      rawCarouselStories,
      continueReadingStories,
      continuePlayingGames,
      trendingStories,
      trendingGames,
      latestStories,
      latestGames,
      categoriesData
    ] = await Promise.all([
      // Carousel
      db.select({
        id: CAROUSEL_STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        cover_img: STORIES.cover_img,
        trailer: STORIES.trailer,
        age_rating: STORIES.age_rating,
        language: STORIES.language,
        story_type: STORIES.story_type,
        story_id: CAROUSEL_STORIES.story_id,
        episode_count: sql`(SELECT COUNT(*) FROM episodes WHERE episodes.story_id = ${STORIES.id})`.as('episode_count'),
      })
      .from(CAROUSEL_STORIES)
      .innerJoin(STORIES, eq(CAROUSEL_STORIES.story_id, STORIES.id))
      .where(
        and(
          gte(new Date(), CAROUSEL_STORIES.start_date),
          or(
            isNull(CAROUSEL_STORIES.end_date),
            gte(CAROUSEL_STORIES.end_date, new Date())
          ),
          eq(CAROUSEL_STORIES.is_visible, true),
          eq(STORIES.is_published, true)
        )
      )
      .orderBy(CAROUSEL_STORIES.position),

      // Continue Reading Stories
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
      .where(
        and(
          userCondition,
          eq(STORIES.is_published, true),
          eq(STORIES.story_type, 'chat')
        )
      )
      .orderBy(desc(USER_LAST_READ.last_read_at))
      .limit(10),

      // Continue Playing Games
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
      .where(
        and(
          userCondition,
          eq(STORIES.is_published, true),
          eq(STORIES.story_type, 'game')
        )
      )
      .orderBy(desc(USER_LAST_READ.last_read_at))
      .limit(10),

      // Trending Stories
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
      .where(and(
        gte(STORIES.created_at, sevenDaysAgo),
        eq(STORIES.is_published, true),
        eq(STORIES.story_type, 'chat')
      ))
      .groupBy(STORIES.id, STORIES.title, STORIES.cover_img)
      .orderBy(sql`views_count DESC`),

      // Trending Games
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
      .where(and(
        gte(STORIES.created_at, sevenDaysAgo),
        eq(STORIES.is_published, true),
        eq(STORIES.story_type, 'game')
      ))
      .groupBy(STORIES.id, STORIES.title, STORIES.cover_img)
      .orderBy(sql`views_count DESC`),

      // Latest Stories
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
      .where(
        and(
          eq(STORIES.is_published, true),
          eq(STORIES.story_type, 'chat')
        )
      )
      .orderBy(desc(STORIES.created_at))
      .limit(10),

      // Latest Games
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
      .where(
        and(
          eq(STORIES.is_published, true),
          eq(STORIES.story_type, 'game')
        )
      )
      .orderBy(desc(STORIES.created_at))
      .limit(10),

      // Categories Metadata
      db.select({
        category_id: CATEGORIES.id,
        name: CATEGORIES.name,
        description: CATEGORIES.description,
        image_url: CATEGORIES.image_url,
      })
      .from(CATEGORIES)
    ]);

    // Batch attach tags for all main section lists concurrently
    const [
      carouselStories,
      continueReadingStoriesWithTags,
      continuePlayingGamesWithTags,
      trendingStoriesWithTags,
      trendingGamesWithTags,
      latestStoriesWithTags,
      latestGamesWithTags
    ] = await Promise.all([
      batchAttachTagsToStories(rawCarouselStories),
      batchAttachTagsToStories(continueReadingStories),
      batchAttachTagsToStories(continuePlayingGames),
      batchAttachTagsToStories(trendingStories),
      batchAttachTagsToStories(trendingGames),
      batchAttachTagsToStories(latestStories),
      batchAttachTagsToStories(latestGames)
    ]);

    // Ensure carousel genres field is populated
    const formattedCarouselStories = carouselStories.map(s => ({
      ...s,
      genres: s.tags || []
    }));

    // Batch fetch category stories for all categories in 1 query
    const categoryIds = categoriesData.map(c => c.category_id);
    let allCategoryStories = [];
    if (categoryIds.length > 0) {
      allCategoryStories = await db
        .select({
          story_id: STORIES.id,
          title: STORIES.title,
          story_type: STORIES.story_type,
          cover_img: STORIES.cover_img,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
          category_id: STORIES.category_id
        })
        .from(STORIES)
        .where(
          and(
            inArray(STORIES.category_id, categoryIds),
            eq(STORIES.is_published, true)
          )
        );
    }

    const categoryStoriesWithTags = await batchAttachTagsToStories(allCategoryStories);

    // Group stories by category_id
    const storiesByCategory = {};
    categoryStoriesWithTags.forEach(story => {
      if (!storiesByCategory[story.category_id]) {
        storiesByCategory[story.category_id] = [];
      }
      storiesByCategory[story.category_id].push(story);
    });

    const categories = categoriesData.map(cat => ({
      id: cat.category_id,
      title: cat.name,
      data: storiesByCategory[cat.category_id] || [],
    }));

    // Merge Continue Reading, Trending, Latest, and Categories
    const mergedCategories = [
      ...(continueReadingStoriesWithTags.length > 0
        ? [{
            id: 'continue-reading-story',
            title: 'Continue Reading Stories',
            data: continueReadingStoriesWithTags,
          }]
        : []),
      ...(continuePlayingGamesWithTags.length > 0
        ? [{
            id: 'continue-reading-game',
            title: 'Continue Reading Games',
            data: continuePlayingGamesWithTags,
          }]
        : []),
      {
        id: 'trendingstory',
        title: 'Trending Stories',
        data: trendingStoriesWithTags,
      },
      {
        id: 'trendingGame',
        title: 'Trending Games',
        data: trendingGamesWithTags,
      },
      {
        id: 'latestStory',
        title: 'Latest Stories',
        data: latestStoriesWithTags,
      },
      {
        id: 'latestGame',
        title: 'Latest Games',
        data: latestGamesWithTags,
      },
      ...categories,
    ];

    const homeData = {
      carouselStories: formattedCarouselStories,
      categories: mergedCategories,
    };

    return NextResponse.json(homeData, { status: 200 });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}