import { NextResponse } from "next/server";
import { db } from "../../../utils/index";
import { USERS } from "../../../utils/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(USERS)
      .where(eq(USERS.email, email));
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered." },
        { status: 400 }
      );
    }

    // Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(USERS).values({ email, password: hashedPassword });

    return NextResponse.json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "An error occurred." },
      { status: 500 }
    );
  }
}
