// app/api/community/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Page } from "@/models/Page";
import { Profile } from "@/models/Profile";

export async function GET() {
  try {
    await connectDB();

    // 1) Find all pages that are published AND opted into community
    const pages = await Page.find({
      published: true,
      communityListed: true,
    }).lean();

    if (!pages.length) {
      return NextResponse.json({ items: [] });
    }

    // 2) Load matching profiles
    const userIds = pages
      .map((p: any) =>
        p.userId && p.userId.toString ? p.userId.toString() : p.userId
      )
      .filter(Boolean);

    const profiles = await Profile.find({ userId: { $in: userIds } }).lean();
    const profileByUserId = new Map(
      profiles.map((p: any) => [
        p.userId && p.userId.toString ? p.userId.toString() : p.userId,
        p,
      ])
    );

    // 3) Build response list
    const items = pages
      .map((p: any) => {
        const uid =
          p.userId && p.userId.toString ? p.userId.toString() : p.userId;
        const prof = profileByUserId.get(uid);

        if (!prof || !prof.username) return null;

        // Try to pick a nice "hero" text from blocks
        let hero = "";
        let description = "";

        if (Array.isArray(p.blocks)) {
          for (const b of p.blocks) {
            if (!hero && b.type === "text" && b.style === "heading") {
              hero = b.text || "";
            }
            if (!description && b.type === "text" && b.style !== "heading") {
              description = b.text || "";
            }
          }
        }

        return {
          username: prof.username,
          displayName: prof.displayName || prof.username,
          title: p.title || "",
          hero,
          description,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Error in /api/community:", err);
    return NextResponse.json(
      { error: "Failed to load community", items: [] },
      { status: 500 }
    );
  }
}
