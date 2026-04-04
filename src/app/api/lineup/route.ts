import { NextRequest, NextResponse } from "next/server";
import { fetchLineup } from "@/lib/lineup";
import { findCachedFestival, cacheFestival } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  try {
    // 1. Check cache first (instant)
    const cached = await findCachedFestival(query);
    if (cached) {
      console.log(`Lineup served from cache: ${cached.name}`);
      return NextResponse.json({ found: true, festival: cached, cached: true });
    }

    // 2. Cache miss — fall back to Claude API with web search
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set in environment");
      return NextResponse.json(
        { found: false, festival: null, error: "API key not configured" },
        { status: 500 }
      );
    }

    const festival = await fetchLineup(query);
    if (!festival) {
      return NextResponse.json({ found: false, festival: null });
    }

    // 3. Save to cache for next time (fire and forget)
    cacheFestival(festival).catch((err) =>
      console.error("Failed to cache festival:", err)
    );

    return NextResponse.json({ found: true, festival, cached: false });
  } catch (err) {
    console.error("Lineup API error:", err);
    return NextResponse.json(
      { found: false, festival: null, error: "Failed to fetch lineup" },
      { status: 500 }
    );
  }
}
