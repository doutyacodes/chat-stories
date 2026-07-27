import { NextResponse } from 'next/server';
import { eq, count, sql } from 'drizzle-orm';
import { db } from '@/utils';
import { USERS, STORIES, STORY_VIEWS, STORY_LIKES, STORY_SUBSCRIPTIONS, USER_LAST_READ, STORY_SAVED } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    const userId = authResult.decoded_Data.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 1. Fetch Basic User Info
    const userRes = await db
      .select({
        id: USERS.id,
        username: USERS.username,
        email: USERS.email,
        created_at: USERS.created_at,
      })
      .from(USERS)
      .where(eq(USERS.id, userId))
      .limit(1);

    if (!userRes.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userRes[0];

    // 2. Fetch Reader Stats
    const [historyCountRes] = await db
      .select({ count: count() })
      .from(USER_LAST_READ)
      .where(eq(USER_LAST_READ.user_id, userId));

    const [likedCountRes] = await db
      .select({ count: count() })
      .from(STORY_LIKES)
      .where(eq(STORY_LIKES.user_id, userId));

    const [savedCountRes] = await db
      .select({ count: count() })
      .from(STORY_SAVED)
      .where(eq(STORY_SAVED.user_id, userId));

    const [subscriptionsCountRes] = await db
      .select({ count: count() })
      .from(STORY_SUBSCRIPTIONS)
      .where(eq(STORY_SUBSCRIPTIONS.subscriber_id, userId));

    // 3. Fetch Creator Stats
    // Check total stories created by user
    const userStories = await db
      .select({ id: STORIES.id, is_published: STORIES.is_published })
      .from(STORIES)
      .where(eq(STORIES.user_id, userId));

    const totalCreatedStories = userStories.length;
    const isCreator = totalCreatedStories > 0;

    let creatorStats = null;

    if (isCreator) {
      const storyIds = userStories.map((s) => s.id);
      const publishedCount = userStories.filter((s) => s.is_published).length;
      const draftCount = totalCreatedStories - publishedCount;

      // Total views across user's created stories
      let totalViews = 0;
      if (storyIds.length > 0) {
        const viewsRes = await db
          .select({ count: count() })
          .from(STORY_VIEWS)
          .where(sql`${STORY_VIEWS.story_id} IN (${sql.join(storyIds.map((id) => sql`${id}`), sql`, `)})`);
        totalViews = viewsRes[0]?.count || 0;
      }

      // Total likes across user's created stories
      let totalLikes = 0;
      if (storyIds.length > 0) {
        const likesRes = await db
          .select({ count: count() })
          .from(STORY_LIKES)
          .where(sql`${STORY_LIKES.story_id} IN (${sql.join(storyIds.map((id) => sql`${id}`), sql`, `)})`);
        totalLikes = likesRes[0]?.count || 0;
      }

      // Total Subscribers for this user as an author
      const [subscribersRes] = await db
        .select({ count: count() })
        .from(STORY_SUBSCRIPTIONS)
        .where(eq(STORY_SUBSCRIPTIONS.author_id, userId));

      const totalSubscribers = subscribersRes?.count || 0;

      creatorStats = {
        totalStories: totalCreatedStories,
        publishedStories: publishedCount,
        draftStories: draftCount,
        totalViews,
        totalLikes,
        totalSubscribers,
      };
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.created_at ? user.created_at.toISOString() : null,
        },
        isCreator,
        readerStats: {
          historyCount: historyCountRes?.count || 0,
          likedCount: likedCountRes?.count || 0,
          savedCount: savedCountRes?.count || 0,
          subscriptionsCount: subscriptionsCountRes?.count || 0,
        },
        creatorStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching profile summary:', error);
    return NextResponse.json({ error: 'Failed to fetch profile summary' }, { status: 500 });
  }
}
