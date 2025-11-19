// app/api/community/join/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { Page } from "@/models/Page";

export async function POST(req: Request) {
  await connectDB();

  // Extract userId from cookie (you already have a helper for this pattern)
  const cookieHeader = req.headers.get("cookie") || "";
  // reuse your parseCookie + verifyAuthToken util:
  // ...

  const userId = /* from token */;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await Page.findOneAndUpdate(
    { userId, published: true },             // only allow if already published
    { communityListed: true },
    { new: true }
  ).lean();

  if (!page) {
    return NextResponse.json(
      { error: "No published page to list" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
