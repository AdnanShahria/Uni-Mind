import { createClient } from "@libsql/client/web";

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  R2_BUCKET_NAME: string;
  OPENAI_API_KEY: string;
}

// Simple in-memory storage fallback for local testing when database is offline
const mockUsers = new Map<string, any>();
const mockMetadataRequests = new Map<string, any>();

// Utility to generate a pseudo-UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Basic password hashing utility (SHA-256 for demo purposes - use bcrypt/argon2 in production)
async function hashPassword(password: string) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function verifyToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const payload = JSON.parse(atob(token));
    if (payload && payload.userId) {
      return payload;
    }
  } catch (e) {
    return null;
  }
  return null;
}

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

    // Initialize Turso client (if credentials exist)
    const db = (env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN)
      ? createClient({
          url: env.TURSO_DATABASE_URL,
          authToken: env.TURSO_AUTH_TOKEN,
        })
      : null;

    // AUTH: REGISTER ENDPOINT
    if (url.pathname === "/auth/register" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const { name, email, institution, district, country, major, role, password } = body;
        
        if (!email || !password || !name) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const hashedPassword = await hashPassword(password);
        const userId = generateUUID();

        // 1. Attempt Turso DB Registration
        if (db) {
          console.log(`Attempting Turso registration for ${email}...`);
          try {
            // Check if user exists
            const existingUser = await db.execute({
              sql: "SELECT id FROM users WHERE email = ?",
              args: [email]
            });

            if (existingUser.rows.length > 0) {
              return new Response(JSON.stringify({ error: "User already exists" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            }

            // Insert new user
            await db.execute({
              sql: `INSERT INTO users (
                id, email, password_hash, name, institution, district, country, major, role
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                userId, email, hashedPassword, name, institution || '', 
                district || '', country || '', major || '', role || ''
              ]
            });

            console.log("Turso registration successful!");
            return new Response(JSON.stringify({
              success: true,
              message: "Registered successfully in Turso Edge DB!",
              user: {
                id: userId,
                email,
                name,
                institution,
                major,
                role
              }
            }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });

          } catch (dbErr: any) {
            console.error("Turso connection failed (offline mode fallback activated):", dbErr.message || dbErr);
          }
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
          id: userId,
          email,
          name,
          institution,
          district,
          country,
          major,
          role,
          password: hashedPassword
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

        const hashedPassword = await hashPassword(password);

        // 1. Attempt Turso DB Login
        if (db) {
          console.log(`Attempting Turso authorization for ${email}...`);
          try {
            const result = await db.execute({
              sql: "SELECT * FROM users WHERE email = ? AND password_hash = ?",
              args: [email, hashedPassword]
            });

            if (result.rows.length > 0) {
              const userRow = result.rows[0];
              console.log("Turso authorization successful!");
              
              // We generate a simple JWT or just return a mock token for now
              const mockToken = btoa(JSON.stringify({ userId: userRow.id, email }));

              return new Response(JSON.stringify({
                success: true,
                message: "Authorized in Turso DB!",
                token: mockToken, // In production, generate a real signed JWT
                user: {
                  id: userRow.id,
                  email: userRow.email,
                  name: userRow.name,
                  institution: userRow.institution,
                  major: userRow.major,
                  role: userRow.role
                }
              }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            } else {
              if (!mockUsers.has(email)) {
                return new Response(JSON.stringify({ error: "Invalid email or password" }), {
                  status: 401,
                  headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
              }
            }
          } catch (dbErr: any) {
            console.error("Turso connection failed (offline mode fallback activated):", dbErr.message || dbErr);
          }
        }

        // 2. Fallback to Local Database
        console.log(`Authorizing ${email} in local offline database fallback...`);
        const user = mockUsers.get(email);
        
        if (user && user.password === hashedPassword) {
          const mockToken = btoa(JSON.stringify({ userId: user.id, email }));
          return new Response(JSON.stringify({
            success: true,
            message: "Authorized in local fallback database (Offline Mode)!",
            token: mockToken,
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

    // API: FEED ENDPOINT (Mocked for now, reads from Turso if available)
    if (url.pathname === "/api/feed" && request.method === "GET") {
      try {
        if (db) {
          const result = await db.execute(`
            SELECT p.*, u.name as author_name 
            FROM posts p
            JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 10
          `);
          
          if (result.rows.length > 0) {
            return new Response(JSON.stringify({ success: true, data: result.rows }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        }
        
        // Mock fallback data
        const mockFeed = [
          {
            id: generateUUID(),
            title: "Exploring Custom Edge Databases",
            content: "Just migrated UniMind to Turso and the edge reads are insane!",
            type: "text",
            created_at: new Date().toISOString(),
            author_name: "Adnan Shahria"
          }
        ];

        return new Response(JSON.stringify({ success: true, data: mockFeed, fallback: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // API: FOLDERS CRUD ENDPOINTS
    if (url.pathname.startsWith("/api/folders")) {
      const payload = verifyToken(request);
      if (!payload) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      }

      try {
        if (request.method === "GET") {
          if (db) {
            const res = await db.execute({
              sql: "SELECT * FROM folders WHERE user_id = ?",
              args: [payload.userId]
            });
            return new Response(JSON.stringify({ success: true, data: res.rows }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ success: true, data: [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method === "POST") {
          const body: any = await request.json();
          const { name, color } = body;
          
          if (!name || typeof name !== "string" || !name.trim()) {
            return new Response(JSON.stringify({ error: "Folder name is required" }), { status: 400, headers: corsHeaders });
          }

          const folderId = body.id || generateUUID();
          if (db) {
            await db.execute({
              sql: "INSERT OR REPLACE INTO folders (id, user_id, name, color) VALUES (?, ?, ?, ?)",
              args: [folderId, payload.userId, name.trim(), color || ""]
            });
          }
          return new Response(JSON.stringify({ success: true, data: { id: folderId, name: name.trim(), color } }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (err: any) {
        console.error("Folders API error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // API: NOTES CRUD ENDPOINTS
    if (url.pathname.startsWith("/api/notes")) {
      const payload = verifyToken(request);
      if (!payload) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      }

      try {
        if (request.method === "GET") {
          if (db) {
            const res = await db.execute({
              sql: "SELECT * FROM notes WHERE author_id = ? ORDER BY created_at DESC",
              args: [payload.userId]
            });
            return new Response(JSON.stringify({ success: true, data: res.rows }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ success: true, data: [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method === "POST") {
          const body: any = await request.json();
          const { folder_id, title, course, content, file_url, is_starred, visibility, studio_data } = body;
          
          if (!title || typeof title !== "string" || !title.trim()) {
            return new Response(JSON.stringify({ error: "Note title is required" }), { status: 400, headers: corsHeaders });
          }

          const noteId = body.id || generateUUID();
          if (db) {
            await db.execute({
              sql: `INSERT OR REPLACE INTO notes (
                id, author_id, folder_id, title, course, content, file_url, is_starred, visibility, studio_data
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                noteId, payload.userId, folder_id || null, title.trim(), course || "",
                content || "", file_url || "", is_starred ? 1 : 0, visibility || "private", studio_data || null
              ]
            });
          }
          return new Response(JSON.stringify({ success: true, data: { id: noteId, title: title.trim(), content } }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method === "DELETE") {
          const noteId = url.searchParams.get("id");
          if (!noteId) {
            return new Response(JSON.stringify({ error: "Missing note ID" }), { status: 400, headers: corsHeaders });
          }
          if (db) {
            await db.execute({
              sql: "DELETE FROM notes WHERE id = ? AND author_id = ?",
              args: [noteId, payload.userId]
            });
          }
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (err: any) {
        console.error("Notes API error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // API: TASKS CRUD ENDPOINTS
    if (url.pathname.startsWith("/api/tasks")) {
      const payload = verifyToken(request);
      if (!payload) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
      }

      try {
        if (request.method === "GET") {
          if (db) {
            const res = await db.execute({
              sql: "SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC",
              args: [payload.userId]
            });
            return new Response(JSON.stringify({ success: true, data: res.rows }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ success: true, data: [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method === "POST") {
          const body: any = await request.json();
          const { title, description, due_date, status, priority } = body;
          
          if (!title || typeof title !== "string" || !title.trim()) {
            return new Response(JSON.stringify({ error: "Task title is required" }), { status: 400, headers: corsHeaders });
          }

          const taskId = body.id || generateUUID();
          if (db) {
            await db.execute({
              sql: `INSERT OR REPLACE INTO tasks (
                id, user_id, title, description, due_date, status, priority
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              args: [
                taskId, payload.userId, title.trim(), description || "",
                due_date || null, status || "pending", priority || "medium"
              ]
            });
          }
          return new Response(JSON.stringify({ success: true, data: { id: taskId, title: title.trim(), status } }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method === "DELETE") {
          const taskId = url.searchParams.get("id");
          if (!taskId) {
            return new Response(JSON.stringify({ error: "Missing task ID" }), { status: 400, headers: corsHeaders });
          }
          if (db) {
            await db.execute({
              sql: "DELETE FROM tasks WHERE id = ? AND user_id = ?",
              args: [taskId, payload.userId]
            });
          }
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // API: METADATA APPROVED ENDPOINT
    if (url.pathname === "/api/metadata/approved" && request.method === "GET") {
      try {
        let rows: any[] = [];
        if (db) {
          const res = await db.execute("SELECT * FROM metadata_requests WHERE status IN ('approved', 'pending')");
          rows = res.rows;
        } else {
          rows = Array.from(mockMetadataRequests.values()).filter(r => r.status === 'approved' || r.status === 'pending');
        }

        const institutionsMap = new Map<string, { value: string; isCustom: boolean }>();
        const majorsMap = new Map<string, { value: string; isCustom: boolean }>();
        const sessionsMap = new Map<string, { value: string; isCustom: boolean }>();
        const rolesMap = new Map<string, { value: string; isCustom: boolean }>();

        for (const row of rows) {
          const val = row.new_value;
          const cleanVal = val.includes(' | University: ') ? val.split(' | University: ')[0] : val;
          const isCustom = row.requester_email !== 'system@unimind.edu';

          const item = { value: cleanVal, isCustom };

          if (row.request_type === 'institution') {
            if (!institutionsMap.has(cleanVal) || !isCustom) {
              institutionsMap.set(cleanVal, item);
            }
          } else if (row.request_type === 'major') {
            if (!majorsMap.has(cleanVal) || !isCustom) {
              majorsMap.set(cleanVal, item);
            }
          } else if (row.request_type === 'session') {
            if (!sessionsMap.has(cleanVal) || !isCustom) {
              sessionsMap.set(cleanVal, item);
            }
          } else if (row.request_type === 'role') {
            if (!rolesMap.has(cleanVal) || !isCustom) {
              rolesMap.set(cleanVal, item);
            }
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            institutions: Array.from(institutionsMap.values()),
            majors: Array.from(majorsMap.values()),
            sessions: Array.from(sessionsMap.values()),
            roles: Array.from(rolesMap.values())
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            }
          }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // API: METADATA REQUESTS CRUD ENDPOINTS
    if (url.pathname.startsWith("/api/metadata-requests")) {
      try {
        if (request.method === "GET") {
          if (db) {
            const res = await db.execute("SELECT * FROM metadata_requests ORDER BY created_at DESC");
            return new Response(JSON.stringify({ success: true, data: res.rows }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
          const localRequests = Array.from(mockMetadataRequests.values());
          return new Response(JSON.stringify({ success: true, data: localRequests }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method === "POST") {
          const body: any = await request.json();
          const { requester_email, request_type, action_type, old_value, new_value, status } = body;
          
          if (!requester_email || !request_type || !action_type || !new_value) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
          }

          const requestId = body.id || generateUUID();
          const createdAt = new Date().toISOString();
          
          if (db) {
            await db.execute({
              sql: `INSERT INTO metadata_requests (
                id, requester_email, request_type, action_type, old_value, new_value, status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                requestId, requester_email, request_type, action_type, 
                old_value || null, new_value, status || "pending", createdAt, createdAt
              ]
            });
          }
          
          const newRequest = {
            id: requestId,
            requester_email,
            request_type,
            action_type,
            old_value: old_value || null,
            new_value,
            status: status || "pending",
            created_at: createdAt,
            updated_at: createdAt
          };
          mockMetadataRequests.set(requestId, newRequest);

          return new Response(JSON.stringify({ success: true, data: newRequest }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        if (request.method === "PUT") {
          const requestId = url.searchParams.get("id");
          if (!requestId) {
            return new Response(JSON.stringify({ error: "Missing request ID" }), { status: 400, headers: corsHeaders });
          }
          
          const body: any = await request.json();
          const { status } = body;

          const updatedAt = new Date().toISOString();

          if (db) {
            await db.execute({
              sql: "UPDATE metadata_requests SET status = ?, updated_at = ? WHERE id = ?",
              args: [status, updatedAt, requestId]
            });
          }

          const req = mockMetadataRequests.get(requestId);
          if (req) {
            req.status = status;
            req.updated_at = updatedAt;
            mockMetadataRequests.set(requestId, req);
          }

          return new Response(JSON.stringify({ success: true, data: { id: requestId, status } }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (err: any) {
        console.error("Metadata Requests API error:", err);
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
