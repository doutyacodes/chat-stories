import { NextResponse } from 'next/server';
import { eq, count, and, ne } from 'drizzle-orm';
import { EPISODES, STORIES, USERS } from '@/utils/schema';
import { db } from '@/utils';

export const maxDuration = 300; // Maximum duration of the function execution
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { storyId } = await params; // Extract storyId from route params
//   const authResult = await authenticate(request);
//   if (!authResult.authenticated) {
//     return authResult.response;
//   }

  try {
    const storyDetails = await db
      .select({
        id: STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        coverImg: STORIES.cover_img,
        storyType: STORIES.story_type,
        categoryId: STORIES.category_id,
        hasEpisodes: STORIES.has_episodes,
        authorId: STORIES.user_id,
        ageRating: STORIES.age_rating,
        language: STORIES.language,
      })
      .from(STORIES)
      .where(eq(STORIES.id, parseInt(storyId)));

    if (storyDetails.length === 0) {
      return NextResponse.json(
        { error: 'Story not found.' },
        { status: 404 }
      );
    }

    const story = storyDetails[0];

    // Fetch tags for story
    let storyTags = [];
    try {
      const { TAGS, STORY_TAGS } = await import('@/utils/schema');
      const tagRecords = await db
        .select({ name: TAGS.name })
        .from(STORY_TAGS)
        .innerJoin(TAGS, eq(STORY_TAGS.tag_id, TAGS.id))
        .where(eq(STORY_TAGS.story_id, story.id));
      storyTags = tagRecords.map(t => t.name);
    } catch (e) {
      console.error("Error fetching story tags:", e);
    }

    // Fetch episodes related to the story
    const episodes = await db
      .select({
        id: EPISODES.id,
        name: EPISODES.name,
        synopsis: EPISODES.synopsis,
        episodeNumber: EPISODES.episode_number,
      })
      .from(EPISODES)
      .where(eq(EPISODES.story_id, story.id));

    // Fetch author details
    const authorDetails = await db
      .select({
         authorId: USERS.id, 
         username: USERS.username 
        })
      .from(USERS)
      .where(eq(USERS.id, story.authorId));

    const author = authorDetails[0]?.username || 'Unknown';

    // Fetch similar stories based on the category
    const similarStories = await db
    .select({
        storyId: STORIES.id,
        title: STORIES.title,
        coverImg: STORIES.cover_img,
        storyType: STORIES.story_type,
        ageRating: STORIES.age_rating,
        language: STORIES.language,
    })
    .from(STORIES)
    .where(
        and(
        eq(STORIES.category_id, story.categoryId),
        eq(STORIES.is_published, true),
        ne(STORIES.id, story.id)
        )
    );

    const similarStoriesData = {
      id: 'similar',
      title: 'Similar Stories',
      data: similarStories.map((similar) => ({
        story_id: similar.storyId,
        title: similar.title,
        cover_img: similar.coverImg,
        story_type: similar.storyType,
        age_rating: similar.ageRating,
        language: similar.language,
      })),
    };

    // Construct the response
    const responseData = {
      story: {
        id: story.id,
        title: story.title,
        synopsis: story.synopsis,
        cover_img: story.coverImg,
        story_type: story.storyType,
        has_episodes: story.hasEpisodes,
        age_rating: story.ageRating || '13+',
        language: story.language || 'English',
        tags: storyTags,
        author,
        authorId: authorDetails[0]?.authorId
      },
      episodes,
      similarStories: similarStoriesData,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Error fetching story overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story overview. Please try again.' },
      { status: 500 }
    );
  }
}
