import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("DB health error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
