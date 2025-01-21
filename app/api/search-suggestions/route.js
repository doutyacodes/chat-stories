// /api/search-suggestions/route.js
import { NextResponse } from 'next/server';
import { sql, like, or, and, eq, desc } from 'drizzle-orm';
import { STORIES } from '@/utils/schema';
import { db } from '@/utils';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get unique titles matching the search query
    const results = await db
      .select({
        title: STORIES.title,
      })
      .from(STORIES)
      .where(
        and(
          eq(STORIES.is_published, true),
          or(
            like(STORIES.title, `%${query}%`),
            like(STORIES.synopsis, `%${query}%`)
          )
        )
      )
      .orderBy(desc(STORIES.created_at))
      .limit(5);

    const suggestions = results.map(result => result.title);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}