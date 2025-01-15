// app/api/login/route.js
import { compare } from "bcryptjs";
import { USERS } from "../../../utils/schema";
import { db } from "../../../utils";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function POST(req) {
  try {
    const { email , password } = await req.json();

    // Fetch user from the database by username
    const users = await db
      .select()
      .from(USERS)
      .where(eq(USERS.email, email))
      .limit(1)
      .execute();

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
    );

    return NextResponse.json(
      { message: "Login successful", token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
