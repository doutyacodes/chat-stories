import { NextResponse } from 'next/server';
import { EPISODES, STORIES } from '@/utils/schema';
import { db } from '@/utils';
import { eq, and, gt } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { storyId, episodeId } = params;

  try {
    const currentEpisode = await db
      .select({ episode_number: EPISODES.episode_number })
      .from(EPISODES)
      .where(
        and(
          eq(EPISODES.id, episodeId),
          eq(EPISODES.story_id, storyId)
        )
      )
      .limit(1);

    if (!currentEpisode || currentEpisode.length === 0) {
      return NextResponse.json(null, { status: 404 });
    }

    const nextEpisode = await db
      .select({
        id: EPISODES.id,
        story_id: EPISODES.story_id,
        name: EPISODES.name,
        episode_number: EPISODES.episode_number
      })
      .from(EPISODES)
      .where(
        and(
          eq(EPISODES.story_id, storyId),
          gt(EPISODES.episode_number, currentEpisode[0].episode_number)
        )
      )
      .orderBy(EPISODES.episode_number)
      .limit(1);

    return NextResponse.json(nextEpisode[0] || null);
  } catch (error) {
    console.error('Next Episode Fetch Error:', error);
    return NextResponse.json(null, { status: 500 });
  }
}