import { z } from "zod";
import { hash } from "bcryptjs";
import { db } from "../../../utils/index";
import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import jwt from "jsonwebtoken"; // Import jwt
import { USERS } from "../../../utils/schema";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Replace with your actual secret key

export async function POST(req) {
  try {
    const { email, username, password } = await req.json();

    const existingUser = await db
      .select()
      .from(USERS)
      .where(
        eq(USERS.email, email),
      )
      .limit(1)
      .execute();

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Email already in use." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user record in the database
    const newUser = await db.insert(USERS).values({
      email,
      username: username,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser[0].insertId, username: username }, // Include relevant user info in token
      JWT_SECRET,
    );

    return NextResponse.json(
      { message: "User created successfully", user: newUser, token },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
