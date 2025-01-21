// import { NextResponse } from 'next/server';
// import {
//   CAROUSEL_STORIES,
//   STORIES,
//   STORY_VIEWS,
//   CATEGORIES,
// } from '../../../../utils/schema';
// import { db } from '../../../../utils';
// import { eq, gte, and, or, isNull, lt, sql, desc } from 'drizzle-orm';

// export async function GET(request) {
//   try {
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     // Fetch Carousel Stories
//     const carouselStories = await db
//     .select({
//       id: CAROUSEL_STORIES.id,
//       title: STORIES.title,
//       synopsis: STORIES.synopsis,
//       cover_img: STORIES.cover_img,
//       story_type: STORIES.story_type,
//       story_id: CAROUSEL_STORIES.story_id,
//     })
//     .from(CAROUSEL_STORIES)
//     .innerJoin(STORIES, eq(CAROUSEL_STORIES.story_id, STORIES.id))
//     .where(
//       and(
//         gte(new Date(), CAROUSEL_STORIES.start_date), // Today's date is after or equal to the start date
//         or(
//           isNull(CAROUSEL_STORIES.end_date),          // No end date
//           gte(CAROUSEL_STORIES.end_date, new Date()) // Today's date is before or equal to the end date
//         ),
//         eq(CAROUSEL_STORIES.is_visible, true),        // Story is visible
//         eq(STORIES.is_published, true)               // Story is published
//       )
//     )
//     .orderBy(CAROUSEL_STORIES.position);
  

//     // Fetch Trending Stories (include stories with zero views)
//     const trendingStories = await db
//     .select({
//         story_id: STORIES.id, // Use STORIES.id to ensure we get all stories
//         title: STORIES.title,
//         cover_img: STORIES.cover_img,
//         story_type: STORIES.story_type,
//         views_count: sql`IFNULL(COUNT(${STORY_VIEWS.id}), 0)`.as('views_count'), // Count views or default to 0
//     })
//     .from(STORIES)
//     .leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id)) // Use a LEFT JOIN to include stories without views
//     .where(gte(STORIES.created_at, sevenDaysAgo)) // Include stories created within the last 7 days
//     .groupBy(STORIES.id, STORIES.title, STORIES.cover_img) // Group by STORIES fields
//     .orderBy(sql`views_count DESC`); // Order by view count, descending

//     // Fetch Latest Stories
//     const latestStories = await db
//       .select({
//         story_id: STORIES.id,
//         title: STORIES.title,
//         cover_img: STORIES.cover_img,
//         story_type: STORIES.story_type,
//         created_at: STORIES.created_at,
//       })
//       .from(STORIES)
//       .where(eq(STORIES.is_published, true))
//       .orderBy(desc(STORIES.created_at)) // Get the most // Newest first
//       .limit(10);

//     // Fetch Categories and Stories
//     const categoriesData = await db
//       .select({
//         category_id: CATEGORIES.id,
//         name: CATEGORIES.name,
//         description: CATEGORIES.description,
//         image_url: CATEGORIES.image_url,
//       })
//       .from(CATEGORIES);

//     const categories = [];

//     for (const category of categoriesData) {
//       const categoryStories = await db
//         .select({
//           story_id: STORIES.id,
//           title: STORIES.title,
//           story_type: STORIES.story_type,
//           cover_img: STORIES.cover_img,
//         })
//         .from(STORIES)
//         .where(
//           and(
//             eq(STORIES.category_id, category.category_id),
//             eq(STORIES.is_published, true)
//           )
//         );

//       categories.push({
//         id: category.category_id,
//         title: category.name,
//         data: categoryStories,
//       });
//     }

//     // Merge Trending, Latest, and Categories
//     const mergedCategories = [
//       {
//         id: 'trending',
//         title: 'Trending Stories',
//         data: trendingStories,
//       },
//       {
//         id: 'latest',
//         title: 'Latest Stories',
//         data: latestStories,
//       },
//       ...categories,
//     ];

//     const homeData = {
//       carouselStories,
//       categories: mergedCategories,
//     };

//     return NextResponse.json(homeData, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching homepage data:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch homepage data' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import {
  CAROUSEL_STORIES,
  STORIES,
  STORY_VIEWS,
  CATEGORIES,
  USER_LAST_READ,
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
    const carouselStories = await db
      .select({
        id: CAROUSEL_STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        cover_img: STORIES.cover_img,
        story_type: STORIES.story_type,
        story_id: CAROUSEL_STORIES.story_id,
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
        last_read_at: USER_LAST_READ.last_read_at,
      })
      .from(USER_LAST_READ)
      .innerJoin(STORIES, eq(USER_LAST_READ.story_id, STORIES.id))
      .where(
        and(
          userCondition,
          eq(STORIES.is_published, true)
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
        views_count: sql`IFNULL(COUNT(${STORY_VIEWS.id}), 0)`.as('views_count'),
      })
      .from(STORIES)
      .leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id))
      .where(gte(STORIES.created_at, sevenDaysAgo))
      .groupBy(STORIES.id, STORIES.title, STORIES.cover_img)
      .orderBy(sql`views_count DESC`);

    // Fetch Latest Stories
    const latestStories = await db
      .select({
        story_id: STORIES.id,
        title: STORIES.title,
        cover_img: STORIES.cover_img,
        story_type: STORIES.story_type,
        created_at: STORIES.created_at,
      })
      .from(STORIES)
      .where(eq(STORIES.is_published, true))
      .orderBy(desc(STORIES.created_at))
      .limit(10);

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
        })
        .from(STORIES)
        .where(
          and(
            eq(STORIES.category_id, category.category_id),
            eq(STORIES.is_published, true)
          )
        );

      categories.push({
        id: category.category_id,
        title: category.name,
        data: categoryStories,
      });
    }

    // Merge Continue Reading, Trending, Latest, and Categories
    const mergedCategories = [
      ...(continueReadingStories.length > 0
        ? [{
            id: 'continue-reading',
            title: 'Continue Reading',
            data: continueReadingStories,
          }]
        : []),
      {
        id: 'trending',
        title: 'Trending Stories',
        data: trendingStories,
      },
      {
        id: 'latest',
        title: 'Latest Stories',
        data: latestStories,
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