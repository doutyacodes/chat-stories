import { NextResponse } from 'next/server';
import {
  CAROUSEL_STORIES,
  STORIES,
  STORY_VIEWS,
  CATEGORIES,
  USER_LAST_READ,
  EPISODES,
} from '../../../../utils/schema';
import { db } from '../../../../utils';
import { eq, gte, and, or, isNull, lt, sql, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Get user_id or session_id from request headers/cookies
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    // Extract user_id from the token if present
    const authHeader = request.headers.get('Authorization');
    let user_id = null;

    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Bearer <token>
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_id = decoded.id;
      } catch (error) {
        console.error('Token Decoding Failed:', error);
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch Carousel Stories
    const rawCarouselStories = await db
      .select({
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
      .orderBy(CAROUSEL_STORIES.position);

    // Fetch tags for each carousel story
    const { TAGS, STORY_TAGS } = await import('../../../../utils/schema');
    const carouselStories = await Promise.all(
      rawCarouselStories.map(async (story) => {
        try {
          const tags = await db
            .select({ name: TAGS.name })
            .from(STORY_TAGS)
            .innerJoin(TAGS, eq(STORY_TAGS.tag_id, TAGS.id))
            .where(eq(STORY_TAGS.story_id, story.story_id));
          return {
            ...story,
            genres: tags.map(t => t.name)
          };
        } catch (e) {
          return { ...story, genres: [] };
        }
      })
    );

    // Fetch Continue Reading stories
    const userCondition = user_id 
      ? eq(USER_LAST_READ.user_id, parseInt(user_id))
      : eq(USER_LAST_READ.session_id, session_id);

    const continueReadingStories = await db
      .select({
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
      .limit(10);

    const continuePlayingGames = await db
      .select({
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
      .limit(10);

    // Fetch Trending Stories (include stories with zero views)
    const trendingStories = await db
      .select({
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
      .orderBy(sql`views_count DESC`);

  // Fetch Trending Games (include stories with zero views)
    const trendingGames = await db
    .select({
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
    .orderBy(sql`views_count DESC`);

    // Fetch Latest Stories
    const latestStories = await db
      .select({
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
      .limit(10);

  // Fetch Latest Games
    const latestGames = await db
    .select({
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
    .limit(10);

    // Helper to populate story tags
    const attachTagsToStories = async (storiesList) => {
      return await Promise.all(
        storiesList.map(async (story) => {
          try {
            const tags = await db
              .select({ name: TAGS.name })
              .from(STORY_TAGS)
              .innerJoin(TAGS, eq(STORY_TAGS.tag_id, TAGS.id))
              .where(eq(STORY_TAGS.story_id, story.story_id));
            return { ...story, tags: tags.map(t => t.name) };
          } catch (e) {
            return { ...story, tags: [] };
          }
        })
      );
    };

    // Attach tags to all category lists
    const [
      continueReadingStoriesWithTags,
      continuePlayingGamesWithTags,
      trendingStoriesWithTags,
      trendingGamesWithTags,
      latestStoriesWithTags,
      latestGamesWithTags
    ] = await Promise.all([
      attachTagsToStories(continueReadingStories),
      attachTagsToStories(continuePlayingGames),
      attachTagsToStories(trendingStories),
      attachTagsToStories(trendingGames),
      attachTagsToStories(latestStories),
      attachTagsToStories(latestGames)
    ]);

    // Fetch Categories and Stories
    const categoriesData = await db
      .select({
        category_id: CATEGORIES.id,
        name: CATEGORIES.name,
        description: CATEGORIES.description,
        image_url: CATEGORIES.image_url,
      })
      .from(CATEGORIES);

    const categories = [];

    for (const category of categoriesData) {
      const categoryStories = await db
        .select({
          story_id: STORIES.id,
          title: STORIES.title,
          story_type: STORIES.story_type,
          cover_img: STORIES.cover_img,
          age_rating: STORIES.age_rating,
          language: STORIES.language,
        })
        .from(STORIES)
        .where(
          and(
            eq(STORIES.category_id, category.category_id),
            eq(STORIES.is_published, true)
          )
        );

      const categoryStoriesWithTags = await attachTagsToStories(categoryStories);

      categories.push({
        id: category.category_id,
        title: category.name,
        data: categoryStoriesWithTags,
      });
    }

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
      carouselStories,
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