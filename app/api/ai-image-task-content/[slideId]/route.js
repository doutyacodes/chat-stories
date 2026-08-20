import { NextResponse } from 'next/server';
import { AI_IMAGE_TASKS, SLIDES, SLIDE_CONTENT } from '@/utils/schema';
import { db } from '@/utils';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { slideId } = await params;

  try {
    const sId = parseInt(slideId);
    // Verify slide exists and is of type 'ai_image_task'
    const slide = await db
      .select({
        id: SLIDES.id,
        slide_type: SLIDES.slide_type,
      })
      .from(SLIDES)
      .where(eq(SLIDES.id, sId))
      .limit(1);

    if (!slide || slide.length === 0) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    if (slide[0].slide_type !== 'ai_image_task') {
      return NextResponse.json(
        { error: 'Invalid slide type' },
        { status: 400 }
      );
    }

    // Fetch AI image task data
    const task = await db
      .select({
        id: AI_IMAGE_TASKS.id,
        description: AI_IMAGE_TASKS.description,
      })
      .from(AI_IMAGE_TASKS)
      .where(eq(AI_IMAGE_TASKS.slide_id, sId))
      .limit(1);

    // Fetch optional background/audio content
    const content = await db
      .select({
        media_url: SLIDE_CONTENT.media_url,
        audio_url: SLIDE_CONTENT.audio_url,
      })
      .from(SLIDE_CONTENT)
      .where(eq(SLIDE_CONTENT.slide_id, sId))
      .limit(1);

    return NextResponse.json({
      id: task[0]?.id,
      slide_id: sId,
      description: task[0]?.description || '',
      media_url: content[0]?.media_url || null,
      audio_url: content[0]?.audio_url || null,
    });
  } catch (error) {
    console.error('AI Image Task Content Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI image task content' },
      { status: 500 }
    );
  }
}
