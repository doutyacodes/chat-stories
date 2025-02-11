import { NextResponse } from 'next/server';
import { SLIDES, STORIES, EPISODES } from '@/utils/schema';
import { db } from '@/utils';
import { eq, and } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { storyId, episodeId } = await params;

  try {
      // Fetch story details (title, image, synopsis)
      const story = await db
        .select({
          id: STORIES.id,
          title: STORIES.title,
          synopsis: STORIES.synopsis,
          cover_img: STORIES.cover_img,
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

    // Fetch slides for the specific episode
    const slides = await db
      .select({
        id: SLIDES.id,
        slide_type: SLIDES.slide_type,
        position: SLIDES.position,
        is_locked: SLIDES.is_locked
      })
      .from(SLIDES)
      .where(
        and(
          eq(SLIDES.story_id, storyId),
          eq(SLIDES.episode_id, episodeId)
        )
      )
      .orderBy(SLIDES.position);

    // Fetch Episode audio
    const episode = await db
    .select({
      episode_audio: EPISODES.audio_url,
    })
    .from(EPISODES)
    .where(eq(EPISODES.id, episodeId))

    // Combine story and slides in the response
    return NextResponse.json({
      story: story[0], // Get the first (and only) story
      slides,
      episode_audio: episode[0].episode_audio
    });
  } catch (error) {
    console.error('Slides Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
}