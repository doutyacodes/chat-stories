// import { NextResponse } from 'next/server';
// import { eq, asc } from 'drizzle-orm';
// import { db } from '@/utils';
// import { EPISODES } from '@/utils/schema';

// export async function GET(request, { params }) {
//   const { id:storyId } = params; // Extract `storyId` from the route parameters

//   try {
//     // Fetch all episodes related to the given story ID
//     const episodes = await db
//       .select({
//         id: EPISODES.id,
//         name: EPISODES.name,
//         synopsis: EPISODES.synopsis,
//       })
//       .from(EPISODES)
//       .where(eq(EPISODES.story_id, storyId))
//       .orderBy(asc(EPISODES.episode_number));

//     if (!episodes || episodes.length === 0) {
//       return NextResponse.json(
//         { error: 'No episodes found for this story' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(episodes, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching episodes:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch episodes' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { EPISODES } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq } from 'drizzle-orm';

export async function GET(request, { params }) {
  const { id:storyId } = params; // Extract `storyId` from the route parameters
  
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    
    const episodes = await db
      .select({
        id: EPISODES.id,
        name: EPISODES.name,
        episode_number: EPISODES.episode_number
      })
      .from(EPISODES)
      .where(eq(EPISODES.story_id, storyId))
      .orderBy(EPISODES.episode_number);

    return NextResponse.json(episodes);
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}