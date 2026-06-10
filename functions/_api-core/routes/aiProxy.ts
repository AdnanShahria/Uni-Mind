import { corsHeaders, verifyToken } from "../utils";
import type { Env } from "../index";

const AGENT_ROUTER_URL = "https://agentrouter.org/v1/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Headers required to pass AgentRouter's client fingerprinting check.
const SPOOF_HEADERS = {
  "Originator": "codex_cli_rs",
  "User-Agent": "codex_cli_rs/0.101.0 (Mac OS 26.0.1; arm64) Apple_Terminal/464",
  "Version": "0.101.0",
};

// Basic in-memory rate limiting (per isolate)
// 20 requests per minute per user
const RATE_LIMIT_MAX = 20;
const rateLimits = new Map<string, { count: number, resetTime: number }>();

export async function handleAiProxyRoutes(
  url: URL,
  request: Request,
  env: Env
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

  // Enforce Rate Limiting (requires auth to identify user)
  const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
  if (!payload) {
    return new Response(JSON.stringify({ error: "Unauthorized for AI Proxy" }), { status: 401, headers: corsHeaders });
  }
  
  const userId = payload.userId;
  const now = Date.now();
  let userLimit;

  if (env.RATE_LIMITER) {
    // KV Rate Limiter
    const key = `ratelimit:ai:${userId}`;
    const stored = await env.RATE_LIMITER.get(key, 'json');
    if (stored) {
      userLimit = stored;
    }
    if (!userLimit || now > userLimit.resetTime) {
      userLimit = { count: 0, resetTime: now + 60000 };
    }
    userLimit.count++;
    await env.RATE_LIMITER.put(key, JSON.stringify(userLimit), { expirationTtl: 60 });
  } else {
    // Fallback to in-memory (per isolate)
    userLimit = rateLimits.get(userId);
    if (!userLimit || now > userLimit.resetTime) {
      userLimit = { count: 0, resetTime: now + 60000 };
    }
    userLimit.count++;
    rateLimits.set(userId, userLimit);
  }

  if (userLimit.count > RATE_LIMIT_MAX) {
      return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
  }

  let bodyText;
  try {
      bodyText = await request.text();
      if (bodyText.length > 500000) { // ~500KB limit
        return new Response(JSON.stringify({ error: "Request payload too large" }), { status: 413, headers: corsHeaders });
      }
  } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400, headers: corsHeaders });
  }

  const isAgentRouter = url.searchParams.get("provider") === "agentrouter";
  
  let upstreamUrl = GROQ_URL;
  let apiKey = env.GROQ_API_KEY;
  let headers: any = {
      "Content-Type": "application/json",
  };

  if (isAgentRouter) {
      upstreamUrl = AGENT_ROUTER_URL;
      apiKey = env.VITE_AGENT_ROUTER_API_KEY;
      Object.assign(headers, SPOOF_HEADERS);
  }

  if (!apiKey) {
      return new Response(
          JSON.stringify({ error: `${isAgentRouter ? 'AgentRouter' : 'Groq'} API key not configured on server` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
  }

  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
  headers["Authorization"] = `Bearer ${apiKey}`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: bodyText,
    });

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
