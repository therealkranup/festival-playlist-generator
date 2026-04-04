import { Festival } from "@/types";

// Use Claude API with web search to find festival lineups
export async function fetchLineup(
  query: string
): Promise<Festival | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not set");
    return null;
  }

  const prompt = `Find the complete music festival lineup for: "${query}"

Use web search to find the most current and accurate lineup information.

After searching, return ONLY a JSON object (no markdown, no explanation, no code fences) with this exact structure:
{
  "name": "Festival Name",
  "year": 2026,
  "location": "City, Country",
  "dates": "June 17-20",
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
        "anthropic-beta": "web-search-2025-03-05",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 5,
          },
        ],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Claude API error: ${res.status} - ${errText}`);
      return null;
    }

    const data = await res.json();

    // With web search, the response has multiple content blocks.
    // Find the last text block which should contain the JSON result.
    const textBlocks = (data.content || []).filter(
      (block: { type: string }) => block.type === "text"
    );
    const text = textBlocks.length > 0
      ? textBlocks[textBlocks.length - 1].text?.trim()
      : null;

    console.log("Claude lineup response:", text?.substring(0, 300));

    if (!text || text === "null") return null;

    // Strip markdown code fences if present
    let jsonStr = text;
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    // Try to extract JSON if there's extra text around it
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // Parse the JSON response
    const parsed = JSON.parse(jsonStr);
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
