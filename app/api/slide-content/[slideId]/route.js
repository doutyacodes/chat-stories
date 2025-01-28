import { NextResponse } from 'next/server';
import { SLIDE_CONTENT } from '@/utils/schema';
import { db } from '@/utils';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { slideId } = params;

  try {
    const slideContent = await db
      .select({
        id: SLIDE_CONTENT.id,
        media_type: SLIDE_CONTENT.media_type,
        media_url: SLIDE_CONTENT.media_url,
        audio_url: SLIDE_CONTENT.audio_url,
        description: SLIDE_CONTENT.description
      })
      .from(SLIDE_CONTENT)
      .where(eq(SLIDE_CONTENT.slide_id, slideId))
      .limit(1);

    if (!slideContent || slideContent.length === 0) {
      return NextResponse.json(
        { error: 'Slide content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(slideContent[0]);
  } catch (error) {
    console.error('Slide Content Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slide content' },
      { status: 500 }
    );
  }
}
