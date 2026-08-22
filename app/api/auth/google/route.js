import { NextResponse } from "next/server";
import { db } from "@/utils/index";
import { USERS } from "@/utils/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "@/lib/googleAuth";
import { calculateAge } from "@/lib/ageCalculate";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Google ID token is required" },
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

    // 2. Lookup user by email in database
    const users = await db
      .select()
      .from(USERS)
      .where(eq(USERS.email, googleProfile.email))
      .limit(1)
      .execute();

    const user = users[0];

    // 3. If user exists -> Log them in immediately
    if (user) {
      const userAge = user.date_of_birth ? calculateAge(user.date_of_birth) : null;

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          date_of_birth: user.date_of_birth,
          age: userAge,
        },
        JWT_SECRET
      );

      return NextResponse.json(
        {
          status: "LOGGED_IN",
          message: "Login successful",
          token,
          age: userAge,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        },
        { status: 200 }
      );
    }

    // 4. If new user -> Signal frontend to prompt for Date of Birth & complete registration
    return NextResponse.json(
      {
        status: "NEW_USER",
        message: "Google account verified. Please complete your profile.",
        googleProfile: {
          email: googleProfile.email,
          username: googleProfile.name || googleProfile.email.split("@")[0],
          picture: googleProfile.picture,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Google Auth Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error during Google authentication" },
      { status: 500 }
    );
  }
}
