import { NextResponse } from 'next/server';
import { db } from '../../../../../utils';
import { authenticate } from '../../../../../lib/jwtMiddleware';
import { STORY_SAVED } from '../../../../../utils/schema';
import { eq, and, count } from 'drizzle-orm';


export async function POST(request, { params }) {
    const { storyId } = params;
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    const userId = authResult.decoded_Data.id;
  
    try {
      // Check if already saved
      const existingSave = await db
        .select()
        .from(STORY_SAVED)
        .where(
          and(
            eq(STORY_SAVED.story_id, parseInt(storyId)),
            eq(STORY_SAVED.user_id, userId)
          )
        )
        .limit(1);
  
      if (existingSave.length > 0) {
        // Unsave
        await db
          .delete(STORY_SAVED)
          .where(
            and(
              eq(STORY_SAVED.story_id, parseInt(storyId)),
              eq(STORY_SAVED.user_id, userId)
            )
          );
      } else {
        // Save
        await db.insert(STORY_SAVED).values({
          story_id: parseInt(storyId),
          user_id: userId
        });
      }
  
      return NextResponse.json({
        isSaved: !existingSave.length
      });
    } catch (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Failed to update save' },
        { status: 500 }
      );
    }
  }
  