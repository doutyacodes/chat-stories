import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/utils';
import { USERS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function PUT(req) {
  try {
    const authResult = await authenticate(req, true);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    
    const userId = authResult.decoded_Data.id;
    const { username, email } = await req.json();

    // If updating email, check if it already exists
    if (email) {
      const existingUser = await db
        .select()
        .from(USERS)
        .where(eq(USERS.email, email))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return NextResponse.json(
          { message: "Email already in use." },
          { status: 400 }
        );
      }
    }

    // Update user data
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    await db
      .update(USERS)
      .set(updateData)
      .where(eq(USERS.id, userId));

    // Get updated user data
    const updatedUser = await db
      .select({
        id: USERS.id,
        username: USERS.username,
        email: USERS.email,
      })
      .from(USERS)
      .where(eq(USERS.id, userId))
      .limit(1);

    // Generate new token with updated data
    const token = jwt.sign(
      { 
        id: updatedUser[0].id, 
        username: updatedUser[0].username 
      },
      JWT_SECRET
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      token
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}