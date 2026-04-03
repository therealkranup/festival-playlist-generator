import { Festival } from "@/types";

// Use Claude API to parse festival lineups from web search results
export async function fetchLineup(
  query: string
): Promise<Festival | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    return null;
  }

  // Step 1: Ask Claude to find and parse the lineup
  const prompt = `Find the music festival lineup for: "${query}"

Return ONLY a JSON object (no markdown, no explanation) with this exact structure:
{
  "name": "Festival Name",
  "year": 2026,
  "location": "City, Country",
  "dates": "June 17-20" or null if unknown,
  "artists": ["Artist 1", "Artist 2", "Artist 3"]
}

Important:
- Include ALL artists/bands in the lineup, not just headliners
- Use the official/common name for each artist
- If you cannot find a real lineup for this festival, return exactly: null
- Return ONLY the JSON, nothing else`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error(`Claude API error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const text = data.content?.[0]?.text?.trim();

    if (!text || text === "null") return null;

    // Parse the JSON response
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.artists) || parsed.artists.length === 0) {
      return null;
    }

    return {
      name: parsed.name || query,
      year: parsed.year || new Date().getFullYear(),
      location: parsed.location || undefined,
      dates: parsed.dates || undefined,
      artists: parsed.artists,
    };
  } catch (err) {
    console.error("Lineup fetch error:", err);
    return null;
  }
}
