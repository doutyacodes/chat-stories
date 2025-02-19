import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/utils';
import { USERS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  try {
   
  const authResult = await authenticate(req, true);
    if (!authResult.authenticated) {
        return authResult.response;
    }
  const userId = authResult.decoded_Data.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch user data
    const userData = await db
      .select({
        username: USERS.username,
        email: USERS.email,
        created_at: USERS.created_at,
      })
      .from(USERS)
      .where(eq(USERS.id, userId))
      .limit(1);

    if (!userData.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format the response
    const user = {
      username: userData[0].username,
      email: userData[0].email,
      createdAt: userData[0].created_at.toISOString(),
    };

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}