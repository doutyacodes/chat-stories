import { NextResponse } from 'next/server';

import { sql } from 'drizzle-orm';
import { db } from '@/utils';
import { ADS } from '@/utils/schema';

export async function GET() {
  try {
    // Fetch a random ad using SQL's RAND() function
    const randomAd = await db
      .select({
        id: ADS.id,
        media_type: ADS.media_type,
        media_url: ADS.media_url,
        duration: ADS.duration,
      })
      .from(ADS)
      .orderBy(sql`RAND()`)
      .limit(1);

    if (!randomAd.length) {
      return NextResponse.json(
        { error: 'No ads available' },
        { status: 404 }
      );
    }

    return NextResponse.json(randomAd[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching random ad:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad' },
      { status: 500 }
    );
  }
}