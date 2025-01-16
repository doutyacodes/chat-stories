// API Route: /api/stories/[storyId]/data.js
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { CHARACTERS, EPISODES } from '../../../../../../utils/schema';
import { db } from '../../../../../../utils';

export async function GET(request, { params }) {
  const { storyId } = await params;

  try {
    // Fetch both episodes and characters in parallel
    const [episodes, characters] = await Promise.all([
      db
        .select()
        .from(EPISODES)
        .where(eq(EPISODES.story_id, storyId)),
      db
        .select()
        .from(CHARACTERS)
        .where(eq(CHARACTERS.story_id, storyId))
    ]);

    return NextResponse.json({
      episodes,
      characters
    });
  } catch (error) {
    console.error("Error fetching story data:", error);
    return NextResponse.json(
      { error: 'Failed to fetch story data' },
      { status: 500 }
    );
  }
}