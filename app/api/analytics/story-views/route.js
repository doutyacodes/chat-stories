import { NextResponse } from 'next/server';
import { STORY_VIEWS, USERS, STORIES } from '../../../../utils/schema';
import jwt from 'jsonwebtoken';
import { db } from '../../../../utils';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { story_id, session_id } = await request.json();

    // Extract token if present
    const authHeader = request.headers.get('Authorization');
    let user_id = null;

    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Bearer <token>
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_id = decoded.id;
      } catch (error) {
        console.error('Token Decoding Failed:', error);
      }
    }

    // Check if user or session already exists
    let whereCondition = eq(STORY_VIEWS.story_id, story_id);
    if (user_id) {
      whereCondition = and(whereCondition, eq(STORY_VIEWS.user_id, user_id));
    } else {
      whereCondition = and(whereCondition, eq(STORY_VIEWS.session_id, session_id));
    }

    // Fetch last viewed time for the user or session
    const lastView = await db
      .select({ last_viewed_at: STORY_VIEWS.last_viewed_at })
      .from(STORY_VIEWS)
      .where(whereCondition)
      .orderBy(STORY_VIEWS.last_viewed_at, 'desc')
      .limit(1);

    // If there's a last view and it's within 24 hours, don't insert again
    if (lastView.length > 0) {
      const lastViewedAt = new Date(lastView[0].last_viewed_at);
      const now = new Date();
      const diffInHours = (now - lastViewedAt) / (1000 * 60 * 60); // Convert to hours

      if (diffInHours < 24) {
        return NextResponse.json(
          { message: 'View recorded too recently' },
          { status: 200 }
        );
      }
    }

    // Store the new view
    await db.insert(STORY_VIEWS).values({
      story_id,
      user_id,
      session_id,
      viewed_at: new Date(),
      last_viewed_at: new Date(),
    });

    return NextResponse.json({ message: 'View recorded successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving view:', error);
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    );
  }
}
