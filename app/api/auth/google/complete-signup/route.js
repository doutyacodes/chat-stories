import { NextResponse } from "next/server";
import { db } from "@/utils/index";
import { USERS } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "@/lib/googleAuth";
import { calculateAge } from "@/lib/ageCalculate";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req) {
  try {
    const { idToken, username, date_of_birth } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Google ID token is required" },
        { status: 400 }
      );
    }

    if (!date_of_birth) {
      return NextResponse.json(
        { error: "Date of birth is required" },
        { status: 400 }
      );
    }

    // 1. Verify token with Google
    let googleProfile;
    try {
      googleProfile = await verifyGoogleToken(idToken);
    } catch (err) {
      return NextResponse.json(
        { error: err.message || "Invalid Google token" },
        { status: 401 }
      );
    }

    // 2. Check if user already exists
    const existingUsers = await db
      .select()
      .from(USERS)
      .where(eq(USERS.email, googleProfile.email))
      .limit(1)
      .execute();

    let userId;
    const finalUsername = (username || googleProfile.name || googleProfile.email.split("@")[0]).trim();
    const userAge = calculateAge(date_of_birth);

    if (existingUsers.length > 0) {
      // Existing user: Update date_of_birth / username
      userId = existingUsers[0].id;
      await db
        .update(USERS)
        .set({
          username: finalUsername,
          date_of_birth: new Date(date_of_birth),
        })
        .where(eq(USERS.id, userId))
        .execute();
    } else {
      // New user: Create user with secure random password hash
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await hash(randomPassword, 10);

      const result = await db.insert(USERS).values({
        email: googleProfile.email,
        username: finalUsername,
        password: hashedPassword,
        date_of_birth: new Date(date_of_birth),
      });

      userId = result[0].insertId;
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      {
        id: userId,
        username: finalUsername,
        date_of_birth: date_of_birth,
        age: userAge,
      },
      JWT_SECRET
    );

    return NextResponse.json(
      {
        status: "LOGGED_IN",
        message: "Account created successfully",
        token,
        age: userAge,
        user: {
          id: userId,
          username: finalUsername,
          email: googleProfile.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Google Complete Signup Error:", error);
    return NextResponse.json(
      { error: "Internal server error during account creation" },
      { status: 500 }
    );
  }
}
