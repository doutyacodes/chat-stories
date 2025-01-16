import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../../utils';
import { EPISODES, STORIES, STORY_CONTENT } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(request, { params }) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  
  const { storyId } = params; // Get the storyId from the request params

  try {
    // Fetch story details
    const story = await db
      .select({
        id: STORIES.id,
        title: STORIES.title,
        synopsis: STORIES.synopsis,
        cover_img: STORIES.cover_img,
        story_type: STORIES.story_type,
        created_at: STORIES.created_at,
        updated_at: STORIES.updated_at,
      })
      .from(STORIES)
      .where(eq(STORIES.id, storyId))
      .limit(1);

    if (!story || story.length === 0) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const storyData = story[0];

    // Fetch episodes for the story if they exist
    const episodes = await db
      .select({
        id: EPISODES.id,
        name: EPISODES.name,
        episode_number: EPISODES.episode_number,
      })
      .from(EPISODES)
      .where(eq(EPISODES.story_id, storyId))
      .orderBy(EPISODES.episode_number);

    // Fetch content for each episode, if available
    const episodesWithContent = await Promise.all(episodes.map(async (episode) => {
      const content = await db
        .select({
          content: STORY_CONTENT.content,
        })
        .from(STORY_CONTENT)
        .where(eq(STORY_CONTENT.episode_id, episode.id));

      return {
        ...episode,
        content: content.length > 0 ? content[0].content : null,
      };
    }));

    // Format the response data
    const responseData = {
      id: storyData.id.toString(),
      title: storyData.title,
      synopsis: storyData.synopsis,
      image: storyData.cover_img,
      author: "Author Name", // Assuming this will be fetched or added later
      episodes: episodesWithContent.length > 0 ? episodesWithContent : null,
      createdAt: storyData.created_at.toISOString(),
      updatedAt: storyData.updated_at.toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching story data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
