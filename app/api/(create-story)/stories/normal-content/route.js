import { db } from '../../../../../utils'; // Adjust path as necessary
import { STORY_CONTENT } from '../../../../../utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '../../../../../lib/jwtMiddleware';

export async function POST(request) {
  // Authenticate the request
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const formData = await request.formData();
    const storyId = formData.get('storyId');
    const selectedEpisode = formData.get('selectedEpisode'); // Optional
    const content = formData.get('content');

    // Validate required fields
    if (!storyId || !content) {
      return NextResponse.json(
        { error: 'Story ID and content are required' },
        { status: 400 }
      );
    }

    // Insert content into the story_content table
    await db.insert(STORY_CONTENT).values({
      story_id: parseInt(storyId, 10),
      episode_id: selectedEpisode ? parseInt(selectedEpisode, 10) : null,
      content,
    });

    return NextResponse.json(
      { message: 'Content saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving normal content:', error);
    return NextResponse.json(
      { error: 'Failed to save content. Please try again.' },
      { status: 500 }
    );
  }
}
