import { NextResponse } from 'next/server';
import { db } from '../../../../../utils';
import { STORIES, STORY_LIKES, STORY_SUBSCRIPTIONS } from '../../../../../utils/schema';
import { eq, and, count } from 'drizzle-orm';


export async function GET(request, { params }) {
    const { storyId } = params;
  
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
  
      return NextResponse.json({
        likesCount: likesCount.count,
        subscribersCount: subscribersCount.count
      });
    } catch (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch public data' },
        { status: 500 }
      );
    }
  }