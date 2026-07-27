import { NextResponse } from 'next/server';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { db } from '@/utils';
import { STORY_SUBSCRIPTIONS, USERS, STORIES } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    const userId = authResult.decoded_Data.id;

    // Fetch author subscriptions
    const subscriptions = await db
      .select({
        subscription_id: STORY_SUBSCRIPTIONS.id,
        author_id: STORY_SUBSCRIPTIONS.author_id,
        author_username: USERS.username,
        subscribed_at: STORY_SUBSCRIPTIONS.created_at,
      })
      .from(STORY_SUBSCRIPTIONS)
      .innerJoin(USERS, eq(STORY_SUBSCRIPTIONS.author_id, USERS.id))
      .where(eq(STORY_SUBSCRIPTIONS.subscriber_id, userId))
      .orderBy(desc(STORY_SUBSCRIPTIONS.created_at));

    // Batch enrich with author's subscriber count and story count
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        const [subscribersRes] = await db
          .select({ count: count() })
          .from(STORY_SUBSCRIPTIONS)
          .where(eq(STORY_SUBSCRIPTIONS.author_id, sub.author_id));

        const [storiesRes] = await db
          .select({ count: count() })
          .from(STORIES)
          .where(and(eq(STORIES.user_id, sub.author_id), eq(STORIES.is_published, true)));

        return {
          ...sub,
          subscribersCount: subscribersRes?.count || 0,
          publishedStoriesCount: storiesRes?.count || 0,
        };
      })
    );

    return NextResponse.json({ subscriptions: enrichedSubscriptions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
