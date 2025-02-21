// /api/user/profile/update-password/route.js
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/utils';
import { USERS } from '@/utils/schema';
import { authenticate } from '@/lib/jwtMiddleware';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function PUT(req) {
  try {
    const authResult = await authenticate(req, true);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    
    const userId = authResult.decoded_Data.id;
    const { currentPassword, newPassword } = await req.json();

    // Get current user data
    const user = await db
      .select()
      .from(USERS)
      .where(eq(USERS.id, userId))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user[0].password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await db
      .update(USERS)
      .set({ password: hashedPassword })
      .where(eq(USERS.id, userId));

    // Generate new token (optional, but recommended for security)
    const token = jwt.sign(
      { 
        id: user[0].id, 
        username: user[0].username 
      },
      JWT_SECRET
    );

    return NextResponse.json({
      message: "Password updated successfully",
      token
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { message: "Failed to update password" },
      { status: 500 }
    );
  }
}