import { NextResponse } from 'next/server';
import { db } from '../../../../../../utils';
import { authenticate } from '../../../../../../lib/jwtMiddleware';
import { STORY_SUBSCRIPTIONS } from '../../../../../../utils/schema';
import { eq, and, count } from 'drizzle-orm';

export async function POST(request, { params }) {
    const { authorId } = params;
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    const userId = authResult.decoded_Data.id;

    console.log('userId', userId)
  
    try {
      // Check if already subscribed
      const existingSubscription = await db
        .select()
        .from(STORY_SUBSCRIPTIONS)
        .where(
          and(
            eq(STORY_SUBSCRIPTIONS.author_id, parseInt(authorId)),
            eq(STORY_SUBSCRIPTIONS.subscriber_id, userId)
          )
        )
        .limit(1);
      console.log('logg')

      if (existingSubscription.length > 0) {
        console.log('logg 1')

        // Unsubscribe
        await db
          .delete(STORY_SUBSCRIPTIONS)
          .where(
            and(
              eq(STORY_SUBSCRIPTIONS.author_id, parseInt(authorId)),
              eq(STORY_SUBSCRIPTIONS.subscriber_id, userId)
            )
          );
      } else {
        console.log('logg2')

        // Subscribe
        await db.insert(STORY_SUBSCRIPTIONS).values({
          author_id: parseInt(authorId),
          subscriber_id: userId
        });
      }
      console.log('logg 3')

      // Get updated subscriber count
      const [subscribersCount] = await db
        .select({ count: count() })
        .from(STORY_SUBSCRIPTIONS)
        .where(eq(STORY_SUBSCRIPTIONS.author_id, parseInt(authorId)));
        console.log('logg4')

      return NextResponse.json({
        isSubscribed: !existingSubscription.length,
        subscribersCount: subscribersCount.count
      });
    } catch (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }
  }
  