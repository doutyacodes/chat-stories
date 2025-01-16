import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { STORIES } from '@/utils/schema';
import { db } from '@/utils';

export async function PATCH(request, { params }) {
  const { storyId } = params; // Extract the storyId from the URL
  const { isPublished } = await request.json(); // Get the 'isPublished' value from the request body

  try {
    // Update the story's 'is_published' field based on the request
    const updatedStory = await db
      .update(STORIES)
      .set({ is_published: isPublished })
      .where(eq(STORIES.id, storyId))
      .execute();

    if (updatedStory.length === 0) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Story publish status updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update story publish status' }, { status: 500 });
  }
}
