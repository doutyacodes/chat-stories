import { NextResponse } from 'next/server';
import { db } from '../../../../../utils';
import { authenticate } from '../../../../../lib/jwtMiddleware';
import { STORY_LIKES, } from '../../../../../utils/schema';
import { eq, and, count } from 'drizzle-orm';


export async function POST(request, { params }) {
    const { storyId } = params;
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    const userId = authResult.decoded_Data.id;
  
    try {
      // Check if already liked
      const existingLike = await db
        .select()
        .from(STORY_LIKES)
        .where(
          and(
            eq(STORY_LIKES.story_id, parseInt(storyId)),
            eq(STORY_LIKES.user_id, userId)
          )
        )
        .limit(1);
  
      if (existingLike.length > 0) {
        // Unlike
        await db
          .delete(STORY_LIKES)
          .where(
            and(
              eq(STORY_LIKES.story_id, parseInt(storyId)),
              eq(STORY_LIKES.user_id, userId)
            )
          );
      } else {
        // Like
        await db.insert(STORY_LIKES).values({
          story_id: parseInt(storyId),
          user_id: userId
        });
      }
  
      // Get updated like count
      const [likesCount] = await db
        .select({ count: count() })
        .from(STORY_LIKES)
        .where(eq(STORY_LIKES.story_id, parseInt(storyId)));
  
      return NextResponse.json({
        isLiked: !existingLike.length,
        likesCount: likesCount.count
      });
    } catch (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Failed to update like' },
        { status: 500 }
      );
    }
  }
  