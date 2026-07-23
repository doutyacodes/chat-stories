import { NextResponse } from 'next/server';
import { db } from '../../../utils';
import { TAGS } from '../../../utils/schema';

const DEFAULT_TAGS = [
  "Violence",
  "Gore",
  "Horror",
  "Romance",
  "Drama",
  "Mystery",
  "Action",
  "Sexual Content",
  "Strong Language",
  "Drugs & Substances",
  "Tragedy",
  "Suspense",
  "Fantasy",
  "Sci-Fi",
  "Comedy",
  "Adventure"
];

export async function GET() {
  try {
    let tagsList = await db.select().from(TAGS);

    if (tagsList.length === 0) {
      // Auto seed tags if empty
      for (const tag of DEFAULT_TAGS) {
        try {
          await db.insert(TAGS).values({ name: tag });
        } catch (e) {
          // ignore duplicate entry
        }
      }
      tagsList = await db.select().from(TAGS);
    }

    return NextResponse.json(tagsList, { status: 200 });
  } catch (error) {
    console.error("Error fetching tags:", error);
    // Return fallback list if table doesn't exist yet before user runs SQL
    const fallbackList = DEFAULT_TAGS.map((name, index) => ({ id: index + 1, name }));
    return NextResponse.json(fallbackList, { status: 200 });
  }
}
