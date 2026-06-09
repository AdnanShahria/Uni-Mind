import { corsHeaders } from "../utils";

const AGENT_ROUTER_URL = "https://agentrouter.org/v1/chat/completions";

// Headers required to pass AgentRouter's client fingerprinting check.
// Browsers cannot set User-Agent via fetch(), so we proxy through the backend.
const SPOOF_HEADERS = {
  "Originator": "codex_cli_rs",
  "User-Agent": "codex_cli_rs/0.101.0 (Mac OS 26.0.1; arm64) Apple_Terminal/464",
  "Version": "0.101.0",
};

export async function handleAiProxyRoutes(
  url: URL,
  request: Request,
  env: { VITE_AGENT_ROUTER_API_KEY?: string }
): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/ai-proxy")) return null;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Strip surrounding quotes in case wrangler's .dev.vars parser includes them
  const rawKey = env.VITE_AGENT_ROUTER_API_KEY;
  if (!rawKey) {
    return new Response(
      JSON.stringify({ error: "VITE_AGENT_ROUTER_API_KEY not configured on server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();
  console.log(`[AI Proxy] Raw key length=${rawKey.length}, cleaned length=${apiKey.length}`);
  console.log(`[AI Proxy] Raw first/last char codes: ${rawKey.charCodeAt(0)}, ${rawKey.charCodeAt(rawKey.length - 1)}`);
  console.log(`[AI Proxy] Key starts="${apiKey.substring(0, 10)}..." ends="...${apiKey.substring(apiKey.length - 6)}"`);

  try {
    const body = await request.text();

    const upstreamRes = await fetch(AGENT_ROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...SPOOF_HEADERS,
      },
      body,
    });

    // Stream the response back to the client
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": upstreamRes.headers.get("Content-Type") || "application/json",
    };

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "AI proxy error", details: e?.message || String(e) }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
