export interface Env {
  DATABASE_URL: string;
  SUPABASE_URL: string;
  R2_BUCKET_NAME: string;
  OPENAI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Enable CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Status check endpoint
    if (url.pathname === "/status" || url.pathname === "/") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          workspace: "unimind-backend",
          timestamp: new Date().toISOString(),
          configuration: {
            databaseUrlPresent: !!env.DATABASE_URL,
            supabaseUrlPresent: !!env.SUPABASE_URL,
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
