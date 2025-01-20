import { NextResponse } from 'next/server';
import { db } from '../../../../../utils';
import { authenticate } from '../../../../../lib/jwtMiddleware';
import { STORIES, STORY_LIKES, STORY_SUBSCRIPTIONS, STORY_SAVED } from '../../../../../utils/schema';
import { eq, and, count } from 'drizzle-orm';

// Get user actions for a story (likes, saves, subscriptions)
export async function GET(request, { params }) {
  const { storyId } = params;
  const authResult = await authenticate(request);
  
  try {
    // Get story details including author
    const story = await db
      .select({
        id: STORIES.id,
        user_id: STORIES.user_id,
      })
      .from(STORIES)
      .where(eq(STORIES.id, parseInt(storyId)))
      .limit(1);

    if (!story.length) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    const authorId = story[0].user_id;

    // Get public counts
    const [likesCount] = await db
      .select({ count: count() })
      .from(STORY_LIKES)
      .where(eq(STORY_LIKES.story_id, parseInt(storyId)));

    const [subscribersCount] = await db
      .select({ count: count() })
      .from(STORY_SUBSCRIPTIONS)
      .where(eq(STORY_SUBSCRIPTIONS.author_id, authorId));

    // If not authenticated, return only public data
    if (!authResult.authenticated) {
      return NextResponse.json({
        likesCount: likesCount.count,
        subscribersCount: subscribersCount.count,
        isLiked: false,
        isSaved: false,
        isSubscribed: false
      });
    }

    const userId = authResult.decoded_Data.id;

    // Check if user has liked
    const userLike = await db
      .select()
      .from(STORY_LIKES)
      .where(
        and(
          eq(STORY_LIKES.story_id, parseInt(storyId)),
          eq(STORY_LIKES.user_id, userId)
        )
      )
      .limit(1);

    // Check if user has saved
    const userSave = await db
      .select()
      .from(STORY_SAVED)
      .where(
        and(
          eq(STORY_SAVED.story_id, parseInt(storyId)),
          eq(STORY_SAVED.user_id, userId)
        )
      )
      .limit(1);

    // Check if user has subscribed
    const userSubscription = await db
      .select()
      .from(STORY_SUBSCRIPTIONS)
      .where(
        and(
          eq(STORY_SUBSCRIPTIONS.author_id, authorId),
          eq(STORY_SUBSCRIPTIONS.subscriber_id, userId)
        )
      )
      .limit(1);

    return NextResponse.json({
      likesCount: likesCount.count,
      subscribersCount: subscribersCount.count,
      isLiked: userLike.length > 0,
      isSaved: userSave.length > 0,
      isSubscribed: userSubscription.length > 0
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user actions' },
      { status: 500 }
    );
  }
}