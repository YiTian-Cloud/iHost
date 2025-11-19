// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { Profile } from "@/models/Profile";

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookie = parseCookie(cookieHeader);
    const token = cookie["ihost_auth"];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectDB();

    const profile = await Profile.findOne({ userId: payload.userId }).lean();

    if (!profile) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: {
          id: payload.userId,
          username: profile.username,
          displayName: profile.displayName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

// tiny cookie parser
function parseCookie(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {};
  cookieHeader.split(";").forEach((part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return;
    result[key] = decodeURIComponent(rest.join("="));
  });
  return result;
}
