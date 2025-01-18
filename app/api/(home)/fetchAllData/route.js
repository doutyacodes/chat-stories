// import { NextResponse } from 'next/server';
// import { CAROUSEL_STORIES, STORIES, STORY_VIEWS, CATEGORIES } from '../../../../utils/schema';
// import { db } from '../../../../utils';
// import { eq, gte, and, or, isNull, lt, sql } from 'drizzle-orm';
// import { authenticate } from '../../../../lib/jwtMiddleware';
// import dayjs from 'dayjs';

// export async function GET(request) {
// //   const authResult = await authenticate(request, true);
// //   if (!authResult.authenticated) {
// //     return authResult.response;
// //   }

//   try {
//     // Get the current date and date 7 days ago
//     // const sevenDaysAgo = dayjs().subtract(7, 'days').toDate();

//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     // Fetch Carousel Stories: filter by start_date, end_date, is_visible, and is_published
//     const carouselStories = await db
//       .select({
//         id: CAROUSEL_STORIES.id,
//         title: STORIES.title,
//         synopsis: STORIES.synopsis,
//         cover_img: STORIES.cover_img,
//         story_id: CAROUSEL_STORIES.story_id,
//       })
//       .from(CAROUSEL_STORIES)
//       .innerJoin(STORIES, eq(CAROUSEL_STORIES.story_id, STORIES.id))
//       .where(
//         and(
//           gte(CAROUSEL_STORIES.start_date, new Date()), // Current date
//           or(
//             isNull(CAROUSEL_STORIES.end_date), // Correct usage of isNull
//             lt(CAROUSEL_STORIES.end_date, new Date()) // End date is after current date
//           ),
//           eq(CAROUSEL_STORIES.is_visible, true),
//           eq(STORIES.is_published, true)
//         )
//       )
//       .orderBy(CAROUSEL_STORIES.position);

//     // Fetch Trending Stories: based on views in the last 7 days
//     const trendingStories = await db
//     .select({
//       story_id: STORY_VIEWS.story_id,
//       title: STORIES.title,
//       cover_img: STORIES.cover_img,
//       views_count: sql`COUNT(${STORY_VIEWS.id})`.as("views_count"), // Use SQL for count
//     })
//     .from(STORY_VIEWS)
//     .innerJoin(STORIES, eq(STORY_VIEWS.story_id, STORIES.id))
//     .where(gte(STORY_VIEWS.viewed_at, sevenDaysAgo)) // Use gte for comparison
//     .groupBy(STORY_VIEWS.story_id, STORIES.title, STORIES.cover_img) // Include grouped columns explicitly
//     .orderBy(sql`views_count DESC`); // Use raw SQL for descending order

//     // Fetch Categories and Stories for each category
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
//         const categoryStories = await db
//         .select({
//           title: STORIES.title,
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

//     // Combine all the data
//     const homeData = {
//       carouselStories,
//       trendingStories,
//       categories,
//     };

//     return NextResponse.json(homeData, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching homepage data:', error);
//     return NextResponse.json({ error: 'Failed to fetch homepage data' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import {
  CAROUSEL_STORIES,
  STORIES,
  STORY_VIEWS,
  CATEGORIES,
} from '../../../../utils/schema';
import { db } from '../../../../utils';
import { eq, gte, and, or, isNull, lt, sql } from 'drizzle-orm';

export async function GET(request) {
  try {
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
        gte(new Date(), CAROUSEL_STORIES.start_date), // Today's date is after or equal to the start date
        or(
          isNull(CAROUSEL_STORIES.end_date),          // No end date
          gte(CAROUSEL_STORIES.end_date, new Date()) // Today's date is before or equal to the end date
        ),
        eq(CAROUSEL_STORIES.is_visible, true),        // Story is visible
        eq(STORIES.is_published, true)               // Story is published
      )
    )
    .orderBy(CAROUSEL_STORIES.position);
  

    // Fetch Trending Stories (include stories with zero views)
    const trendingStories = await db
    .select({
        story_id: STORIES.id, // Use STORIES.id to ensure we get all stories
        title: STORIES.title,
        cover_img: STORIES.cover_img,
        story_type: STORIES.story_type,
        views_count: sql`IFNULL(COUNT(${STORY_VIEWS.id}), 0)`.as('views_count'), // Count views or default to 0
    })
    .from(STORIES)
    .leftJoin(STORY_VIEWS, eq(STORIES.id, STORY_VIEWS.story_id)) // Use a LEFT JOIN to include stories without views
    .where(gte(STORIES.created_at, sevenDaysAgo)) // Include stories created within the last 7 days
    .groupBy(STORIES.id, STORIES.title, STORIES.cover_img) // Group by STORIES fields
    .orderBy(sql`views_count DESC`); // Order by view count, descending

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
      .orderBy(STORIES.created_at, 'desc') // Newest first
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

    // Merge Trending, Latest, and Categories
    const mergedCategories = [
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
