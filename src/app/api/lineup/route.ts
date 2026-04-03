import { NextRequest, NextResponse } from "next/server";
import { fetchLineup } from "@/lib/lineup";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  try {
    const festival = await fetchLineup(query);
    if (!festival) {
      return NextResponse.json({ found: false, festival: null });
    }
    return NextResponse.json({ found: true, festival });
  } catch (err) {
    console.error("Lineup API error:", err);
    return NextResponse.json({ error: "Failed to fetch lineup" }, { status: 500 });
  }
}
