import { NextResponse } from 'next/server';
import { USER_LAST_READ, STORIES } from '../../../../utils/schema';
import jwt from 'jsonwebtoken';
import { db } from '../../../../utils';
import { eq, and, desc, inArray } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { story_id, session_id } = await request.json();

    // Extract user_id from the token if present
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

    // Validate that story_id exists
    const storyExists = await db
      .select({ id: STORIES.id })
      .from(STORIES)
      .where(eq(STORIES.id, story_id))
      .limit(1);

    if (!storyExists.length) {
      return NextResponse.json({ error: 'Invalid story_id' }, { status: 400 });
    }


    // Define whereCondition for user_id or session_id
    let whereCondition = eq(USER_LAST_READ.story_id, story_id);
    if (user_id) {
      whereCondition = and(whereCondition, eq(USER_LAST_READ.user_id, user_id));
    } else {
      whereCondition = and(whereCondition, eq(USER_LAST_READ.session_id, session_id));
    }

    // Check if there's an existing read entry
    const existingRead = await db
      .select({ last_read_at: USER_LAST_READ.last_read_at })
      .from(USER_LAST_READ)
      .where(whereCondition)
      .limit(1);

    // If an entry exists, update `last_read_at`
    if (existingRead.length > 0) {
      await db
        .update(USER_LAST_READ)
        .set({ last_read_at: new Date() })
        .where(whereCondition);
    } else {
        // Insert the new visit
        await db.insert(USER_LAST_READ).values({
            user_id,
            session_id,
            story_id,
            last_read_at: new Date(),
        });
    }

    // Fetch the last 10 visits for cleanup
    const userCondition = user_id 
        ? eq(USER_LAST_READ.user_id, user_id)
        : eq(USER_LAST_READ.session_id, session_id);

    const userVisits = await db
        .select({
        id: USER_LAST_READ.id
        })
        .from(USER_LAST_READ)
        .where(userCondition)
        .orderBy(desc(USER_LAST_READ.last_read_at));

    // If more than 10 records exist, delete the oldest ones
  if (userVisits.length > 10) {
    const excessIds = userVisits.slice(10).map((visit) => visit.id);
    
    // Use inArray instead of eq for multiple IDs
    await db
      .delete(USER_LAST_READ)
      .where(inArray(USER_LAST_READ.id, excessIds));
  }
    return NextResponse.json(
      { message: 'Visit recorded successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving visit:', error);
    return NextResponse.json(
      { error: 'Failed to record visit' },
      { status: 500 }
    );
  }
}
