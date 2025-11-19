// app/api/page/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { Page } from "@/models/Page";

function parseCookie(cookieHeader) {
  const result = {};
  cookieHeader.split(";").forEach((part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return;
    result[key] = decodeURIComponent(rest.join("="));
  });
  return result;
}

async function getUserIdFromRequest(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookie = parseCookie(cookieHeader);
  const token = cookie["ihost_auth"];
  if (!token) return null;
  const payload = verifyAuthToken(token);
  return payload ? payload.userId : null;
}

// GET: load current user's page (draft or published)
export async function GET(req) {
  await connectDB();
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let page = await Page.findOne({ userId }).lean();

  if (!page) {
    page = await Page.create({
      userId,
      title: "My iHost Page",
      blocks: [],
      published: false,
      communityListed: false,
    });
    page = page.toObject();
  }

  return NextResponse.json({
    title: page.title || "",
    blocks: page.blocks || [],
    published: !!page.published,
    communityListed: !!page.communityListed,
  });
}

// PUT: save page (draft or publish)
export async function PUT(req) {
  await connectDB();
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, blocks, published, communityListed } = body;

  const cleanedBlocks = Array.isArray(blocks)
    ? blocks.map((b) => ({
        type: b.type === "link" || b.type === "post" ? b.type : "text",
        text: b.text || "",
        url: b.type === "link" ? b.url || "" : "",
        style:
          b.style === "heading" || b.style === "subheading"
            ? b.style
            : "body",
        description: b.description || "",
        content: b.type === "post" ? b.content || "" : "",
      }))
    : [];

  const isPublished = !!published;
  const isListed = isPublished && !!communityListed; // only list if published

  const page = await Page.findOneAndUpdate(
    { userId },
    {
      title: title || "",
      blocks: cleanedBlocks,
      published: isPublished,
      communityListed: isListed,
    },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({
    ok: true,
    published: !!page.published,
    communityListed: !!page.communityListed,
  });
}
