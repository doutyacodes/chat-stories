// API Route: /api/stories/[storyId]/data.js
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { CHARACTERS, EPISODES, STORIES } from '../../../../../../utils/schema';
import { db } from '../../../../../../utils';

export async function GET(request, { params }) {
  const { storyId } = await params;

  try {
    // Fetch both episodes and characters in parallel
    const characters = await db
                    .select()
                    .from(CHARACTERS)
                    .where(eq(CHARACTERS.story_id, storyId))


    const storyType = await db
      .select({storyType: STORIES.story_type})
      .from(STORIES)
      .where(eq(STORIES.id, storyId))

    return NextResponse.json({
      characters,
      storyType
    });
  } catch (error) {
    console.error("Error fetching story data:", error);
    return NextResponse.json(
      { error: 'Failed to fetch story data' },
      { status: 500 }
    );
  }
}