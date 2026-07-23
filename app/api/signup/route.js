import { z } from "zod";
import { hash } from "bcryptjs";
import { db } from "../../../utils/index";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { USERS } from "../../../utils/schema";

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
    const { email, username, password, date_of_birth } = await req.json();

    if (!date_of_birth) {
      return NextResponse.json(
        { message: "Date of birth is required." },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(USERS)
      .where(eq(USERS.email, email))
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
    const userAge = calculateAge(date_of_birth);

    // Create new user record in the database
    const newUser = await db.insert(USERS).values({
      email,
      username: username,
      password: hashedPassword,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
    });

    const userId = newUser[0].insertId;

    // Generate JWT token including DOB and calculated age
    const token = jwt.sign(
      {
        id: userId,
        username: username,
        date_of_birth: date_of_birth,
        age: userAge,
      },
      JWT_SECRET
    );

    return NextResponse.json(
      { message: "User created successfully", user: newUser, token, age: userAge },
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
