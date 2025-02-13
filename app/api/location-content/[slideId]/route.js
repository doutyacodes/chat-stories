// app/api/location-content/[slideId]/route.js
import { NextResponse } from 'next/server';
import { LOCATION_TASKS, SLIDES } from '@/utils/schema';
import { db } from '@/utils';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { slideId } = params;

  try {
    // Verify slide exists and is of type 'location'
    const slide = await db
      .select({
        id: SLIDES.id,
        slide_type: SLIDES.slide_type,
      })
      .from(SLIDES)
      .where(eq(SLIDES.id, slideId))
      .limit(1);

    if (!slide || slide.length === 0) {
      return NextResponse.json(
        { error: 'Slide not found' },
        { status: 404 }
      );
    }

    if (slide[0].slide_type !== 'location') {
      return NextResponse.json(
        { error: 'Invalid slide type' },
        { status: 400 }
      );
    }

    // Fetch location task data
    const locationTask = await db
      .select({
        id: LOCATION_TASKS.id,
        description: LOCATION_TASKS.description,
        latitude: LOCATION_TASKS.latitude,
        longitude: LOCATION_TASKS.longitude,
        radius: LOCATION_TASKS.radius,
      })
      .from(LOCATION_TASKS)
      .where(eq(LOCATION_TASKS.slide_id, slideId))
      .limit(1);

    if (!locationTask || locationTask.length === 0) {
      return NextResponse.json(
        { error: 'Location task not found' },
        { status: 404 }
      );
    }

    // Return the location task data
    return NextResponse.json(locationTask[0]);
  } catch (error) {
    console.error('Location Content Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Location content' },
      { status: 500 }
    );
  }
}