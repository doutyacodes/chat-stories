import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { TAGS, STORY_TAGS } from '@/utils/schema';
import { db } from '@/utils';

export async function GET(request, { params }) {
  try {
    const { storyId } = await params;
    const numericId = parseInt(storyId, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ tags: [] });
    }

    const tagRecords = await db
      .select({ name: TAGS.name })
      .from(STORY_TAGS)
      .innerJoin(TAGS, eq(STORY_TAGS.tag_id, TAGS.id))
      .where(eq(STORY_TAGS.story_id, numericId));

    const tags = tagRecords.map(t => t.name);
    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ tags: [] }, { status: 200 });
  }
}
