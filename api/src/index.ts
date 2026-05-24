export interface Env {
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  R2_BUCKET_NAME: string;
  OPENAI_API_KEY: string;
}

// Simple in-memory storage fallback for local testing when database is offline or project is paused
const mockUsers = new Map<string, any>();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Enable CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Status check endpoint
    if (url.pathname === "/status" || url.pathname === "/") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          workspace: "unimind-api",
          timestamp: new Date().toISOString(),
          configuration: {
            databaseUrlPresent: !!env.DATABASE_URL,
            supabaseUrlPresent: !!env.SUPABASE_URL,
            supabaseAnonKeyPresent: !!env.SUPABASE_ANON_KEY,
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

    // AUTH: REGISTER ENDPOINT
    if (url.pathname === "/auth/register" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const { name, email, institution, major, role, password } = body;
        
        if (!email || !password || !name) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // 1. Attempt Supabase Auth Registration
        try {
          const supabaseUrl = env.SUPABASE_URL;
          const supabaseAnonKey = env.SUPABASE_ANON_KEY;
          
          if (supabaseUrl && supabaseAnonKey) {
            console.log(`Attempting Supabase registration for ${email}...`);
            const signUpResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
              method: 'POST',
              headers: {
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email,
                password,
                data: {
                  name,
                  institution,
                  major,
                  role
                }
              })
            });

            const data: any = await signUpResponse.json();
            
            if (signUpResponse.ok) {
              console.log("Supabase registration successful!");
              return new Response(JSON.stringify({
                success: true,
                message: "Registered successfully in Supabase DB!",
                user: {
                  id: data.id || data.user?.id,
                  email: data.email || data.user?.email,
                  name,
                  institution,
                  major,
                  role
                }
              }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            } else {
              console.warn("Supabase auth responded with error:", data.msg || data.error_description || data.error || JSON.stringify(data));
              // Return the specific Supabase account error (e.g., user already exists)
              if (data.msg || data.error_description) {
                return new Response(JSON.stringify({ error: data.msg || data.error_description }), {
                  status: signUpResponse.status,
                  headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
              }
            }
          }
        } catch (dbErr: any) {
          console.error("Supabase connection failed (offline mode fallback activated):", dbErr.message || dbErr);
        }

        // 2. Fallback to Local Database
        console.log(`Registering ${email} in local offline database fallback...`);
        if (mockUsers.has(email)) {
          return new Response(JSON.stringify({ error: "User already exists in database." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const newUser = {
          id: `local-node-${Math.floor(1000 + Math.random() * 9000)}`,
          email,
          name,
          institution,
          major,
          role,
          password
        };
        mockUsers.set(email, newUser);

        return new Response(JSON.stringify({
          success: true,
          message: "Registered successfully in local fallback database (Offline Mode)!",
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            institution: newUser.institution,
            major: newUser.major,
            role: newUser.role
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // AUTH: LOGIN ENDPOINT
    if (url.pathname === "/auth/login" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const { email, password } = body;

        if (!email || !password) {
          return new Response(JSON.stringify({ error: "Email and password are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // 1. Attempt Supabase Auth Login
        try {
          const supabaseUrl = env.SUPABASE_URL;
          const supabaseAnonKey = env.SUPABASE_ANON_KEY;
          
          if (supabaseUrl && supabaseAnonKey) {
            console.log(`Attempting Supabase authorization for ${email}...`);
            const signInResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
              method: 'POST',
              headers: {
                'apikey': supabaseAnonKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email,
                password
              })
            });

            const data: any = await signInResponse.json();

            if (signInResponse.ok) {
              console.log("Supabase authorization successful!");
              const userMeta = data.user?.user_metadata || {};
              return new Response(JSON.stringify({
                success: true,
                message: "Authorized in Supabase DB!",
                token: data.access_token,
                user: {
                  id: data.user?.id,
                  email: data.user?.email,
                  name: userMeta.name || "Scholar",
                  institution: userMeta.institution || "UniMind Cloud",
                  major: userMeta.major || "Deep Work",
                  role: userMeta.role || "Undergraduate"
                }
              }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            } else {
              console.warn("Supabase auth responded with error:", data.error_description || data.error || JSON.stringify(data));
              
              // If it's a real credential rejection (invalid password), fail instantly unless present in offline fallback
              if (signInResponse.status === 400 && data.error === "invalid_grant") {
                if (!mockUsers.has(email)) {
                  return new Response(JSON.stringify({ error: "Invalid email or password" }), {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                  });
                }
              }
            }
          }
        } catch (dbErr: any) {
          console.error("Supabase connection failed (offline mode fallback activated):", dbErr.message || dbErr);
        }

        // 2. Fallback to Local Database
        console.log(`Authorizing ${email} in local offline database fallback...`);
        const user = mockUsers.get(email);
        
        if (user && user.password === password) {
          return new Response(JSON.stringify({
            success: true,
            message: "Authorized in local fallback database (Offline Mode)!",
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              institution: user.institution,
              major: user.major,
              role: user.role
            }
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        return new Response(JSON.stringify({ error: "Invalid email or password" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
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
