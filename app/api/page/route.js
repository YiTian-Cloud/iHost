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
    });
    page = page.toObject();
  }

  return NextResponse.json({
    title: page.title || "",
    blocks: page.blocks || [],
    published: !!page.published,
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
  const { title, blocks, published } = body;

  const cleanedBlocks = Array.isArray(blocks)
  ? blocks.map((b) => {
      const base = {
        text: b.text || "",
        style:
          b.style === "heading" || b.style === "subheading"
            ? b.style
            : "body",
      };

      if (b.type === "link") {
        return {
          type: "link",
          ...base,
          url: b.url || "",
          description: b.description || "",
          content: "", // links don’t use content
        };
      }

      if (b.type === "post") {
        return {
          type: "post",
          ...base,
          url: "", // no external URL for now
          description: b.description || "",
          content: b.content || "",   // ✅ full article body
        };
      }

      // default fallback: plain text block
      return {
        type: "text",
        ...base,
        url: "",
        description: "",
        content: "",
      };
    })
  : [];

  const page = await Page.findOneAndUpdate(
    { userId },
    {
      title: title || "",
      blocks: cleanedBlocks,
      published: !!published,
    },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json({
    ok: true,
    published: !!page.published,
  });
}
