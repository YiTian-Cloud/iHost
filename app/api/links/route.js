import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { Profile } from "@/models/Profile";
import { Link } from "@/models/Link";

function parseCookie(cookieHeader) {
  const result = {};
  cookieHeader.split(";").forEach((part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return;
    result[key] = decodeURIComponent(rest.join("="));
  });
  return result;
}

// GET - fetch all links
export async function GET(req) {
  await connectDB();

  const cookie = parseCookie(req.headers.get("cookie") || "");
  const token = cookie["ihost_auth"];
  const payload = token ? verifyAuthToken(token) : null;

  if (!payload) {
    return NextResponse.json({ links: [] });
  }

  const links = await Link.find({ userId: payload.userId })
    .sort({ order: 1 })
    .lean();

  return NextResponse.json({ links });
}

// POST - add new link
export async function POST(req) {
  await connectDB();

  const cookie = parseCookie(req.headers.get("cookie") || "");
  const token = cookie["ihost_auth"];
  const payload = token ? verifyAuthToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { label, url } = await req.json();

  const newLink = await Link.create({
    userId: payload.userId,
    label,
    url,
  });

  return NextResponse.json(newLink);
}
