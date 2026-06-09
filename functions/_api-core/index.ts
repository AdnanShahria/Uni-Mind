import { createClient } from "@libsql/client/web";
import { corsHeaders } from "./utils";
import { handleAuthRoutes } from "./routes/auth";
import { handleApiRoutes } from "./routes/api";
import { handleMetadataRoutes } from "./routes/metadata";
import { handleCompressRoutes } from "./routes/compress";
import { handleAllPagesRoutes } from "./pagesRouter";
import { handleDynamicRoute } from "./api/dynamicHandler";
import { handleLlamaParseRoutes } from "./routes/llamaparse";
import { handleAiProxyRoutes } from "./routes/aiProxy";
import { handleWebSearchRoutes } from "./routes/webSearch";

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  R2_BUCKET_NAME: string;
  OPENAI_API_KEY: string;
  LLAMAPARSE_API_KEY: string;
  VITE_IMGBB_API_KEY: string;
  VITE_AGENT_ROUTER_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/status" || url.pathname === "/") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          workspace: "unimind-backend (turso-edition)",
          timestamp: new Date().toISOString(),
          configuration: {
            tursoUrlPresent: !!env.TURSO_DATABASE_URL,
            tursoTokenPresent: !!env.TURSO_AUTH_TOKEN,
            r2BucketNamePresent: !!env.R2_BUCKET_NAME,
            openaiApiKeyPresent: !!env.OPENAI_API_KEY,
          }
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          }
        }
      );
    }

    const db = (env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN)
      ? createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      })
      : null;

    let response = await handleAiProxyRoutes(url, request, env);
    if (response) return response;

    response = await handleWebSearchRoutes(url, request);
    if (response) return response;

    response = await handleAuthRoutes(url, request, db);
    if (response) return response;

    response = await handleApiRoutes(url, request, db);
    if (response) return response;

    response = await handleLlamaParseRoutes(url, request, env);
    if (response) return response;

    response = await handleMetadataRoutes(url, request, db);
    if (response) return response;

    response = await handleCompressRoutes(url, request, db);
    if (response) return response;

    response = await handleDynamicRoute(url, request, db);
    if (response) return response;

    response = await handleAllPagesRoutes(url, request, db);
    if (response) return response;

    return new Response(
      JSON.stringify({ error: "Not Found" }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        }
      }
    );
  }
};

