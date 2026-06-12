import { corsHeaders, verifyToken } from "../utils";
import type { Env } from "../index";

export async function handleImgbbProxyRoutes(
  url: URL,
  request: Request,
  env: Env
): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/imgbb-proxy")) return null;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
  if (!payload) {
    return new Response(JSON.stringify({ error: "Unauthorized for Image Upload" }), { status: 401, headers: corsHeaders });
  }

  const apiKey = env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
      return new Response(
          JSON.stringify({ error: `ImgBB API key not configured on server` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
  }

  try {
    const upstreamUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;

    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      body: request.body,
      headers: {
        "Content-Type": request.headers.get("Content-Type") || "",
      }
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
      JSON.stringify({ error: "Image proxy error", details: e?.message || String(e) }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
