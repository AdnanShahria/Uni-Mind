import { corsHeaders } from "../utils";

export async function handleWebSearchRoutes(
  url: URL,
  request: Request
): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/web-search")) return null;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const query = url.searchParams.get("q");
  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query parameter 'q'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(ddgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!response.ok) {
      throw new Error(`DDG responded with status ${response.status}`);
    }

    const html = await response.text();
    
    // Quick regex parsing to extract snippets (since we can't easily use DOMParser in a worker)
    const snippets: string[] = [];
    const regex = /class="result__snippet[^>]*>(.*?)<\/a>/gi;
    let match;
    while ((match = regex.exec(html)) !== null && snippets.length < 5) {
      // clean html tags
      let text = match[1].replace(/<\/?[^>]+(>|$)/g, "");
      // decode html entities
      text = text.replace(/&quot;/g, '"')
                 .replace(/&amp;/g, '&')
                 .replace(/&#x27;/g, "'")
                 .replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/<b>/gi, '')
                 .replace(/<\/b>/gi, '');
      if (text.trim()) {
        snippets.push(text.trim());
      }
    }

    if (snippets.length === 0) {
      snippets.push("No snippets found. The search engine might be blocking the automated request or returned no results.");
    }

    return new Response(JSON.stringify({ results: snippets }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Search failed", details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
