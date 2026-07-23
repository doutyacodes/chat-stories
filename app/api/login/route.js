import { compare } from "bcryptjs";
import { USERS } from "../../../utils/schema";
import { db } from "../../../utils";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

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

    const userAge = user.date_of_birth ? calculateAge(user.date_of_birth) : null;

    // Generate JWT token
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
      { message: "Login successful", token, age: userAge },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
