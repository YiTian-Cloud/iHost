// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username, displayName } = body;

    if (!email || !password || !username || !displayName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check existing email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    // Check existing username
    const existingProfile = await Profile.findOne({
      username: username.toLowerCase(),
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
    });

    await Profile.create({
      userId: user._id,
      username: username.toLowerCase(),
      displayName,
      bio: "",
      avatarUrl: "",
      theme: "light",
    });

    // For now, just return success; we’ll add JWT cookie later
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
