// app/api/pedometer-content/[slideId]/route.js
import { NextResponse } from 'next/server';
import { PEDOMETER_TASKS, SLIDES } from '@/utils/schema';
import { db } from '@/utils';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { slideId } = params;

  try {
    // Verify slide exists and is of type 'pedometer'
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

    if (slide[0].slide_type !== 'pedometer') {
      return NextResponse.json(
        { error: 'Invalid slide type' },
        { status: 400 }
      );
    }

    // Fetch pedometer task data
    const pedometerTask = await db
      .select({
        id: PEDOMETER_TASKS.id,
        required_steps: PEDOMETER_TASKS.required_steps,
        description: PEDOMETER_TASKS.description,
      })
      .from(PEDOMETER_TASKS)
      .where(eq(PEDOMETER_TASKS.slide_id, slideId))
      .limit(1);

    if (!pedometerTask || pedometerTask.length === 0) {
      return NextResponse.json(
        { error: 'Pedometer task not found' },
        { status: 404 }
      );
    }

    // Return the pedometer task data
    return NextResponse.json(pedometerTask[0]);
  } catch (error) {
    console.error('Pedometer Content Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pedometer content' },
      { status: 500 }
    );
  }
}