// app/api/community/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Page } from "@/models/Page";
import { verifyAuthToken } from "@/lib/auth";

function parseCookie(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {};
  cookieHeader.split(";").forEach((part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return;
    result[key] = decodeURIComponent(rest.join("="));
  });
  return result;
}

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookie = parseCookie(cookieHeader);
  const token = cookie["ihost_auth"];
  if (!token) return null;

  try {
    const payload = verifyAuthToken(token);
    return payload ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark this user's page as "listed in community"
  const page = await Page.findOneAndUpdate(
    { userId },
    { communityListed: true },
    { new: true }
  ).lean();

  if (!page) {
    return NextResponse.json(
      { error: "No page found for this user" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    communityListed: true,
  });
}
