import { hashPassword, generateSalt, signToken, generateUUID, mockUsers, corsHeaders } from '../utils';
import type { Env } from '../index';

export async function handleAuthRoutes(url: URL, request: Request, db: any, env: Env): Promise<Response | null> {
  const JWT_SECRET = env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
  
  if (url.pathname === "/auth/register" && request.method === "POST") {
    try {
      const body: any = await request.json();
      const { name, institution, district, country, major, session, role, password } = body;
      const email = body.email?.trim().toLowerCase();
      
      if (!email || !password || !name) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);
      const combinedPasswordData = `${salt}:${hashedPassword}`;
      const userId = generateUUID();

      if (db) {
        console.log(`Attempting Turso registration for ${email}...`);
        try {
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

          await db.execute({
            sql: `INSERT INTO users (
              id, email, password_hash, name, institution, district, country, major, session, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              userId, email, combinedPasswordData, name, institution || '', 
              district || '', country || '', major || '', session || '', role || ''
            ]
          });

          console.log("Turso registration successful!");
          return new Response(JSON.stringify({
            success: true,
            message: "Registered successfully in Turso Edge DB!",
            user: { id: userId, email, name, institution, major, session, role }
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });

        } catch (dbErr: any) {
          console.error("Turso connection failed (offline mode fallback activated):", dbErr.message || dbErr);
        }
      }

      return new Response(JSON.stringify({ error: "Failed to register. Please try again later." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }

  if (url.pathname === "/auth/login" && request.method === "POST") {
    try {
      const body: any = await request.json();
      const { password } = body;
      const email = body.email?.trim().toLowerCase();

      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email and password are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (db) {
        console.log(`Attempting Turso authorization for ${email}...`);
        try {
          const result = await db.execute({
            sql: "SELECT * FROM users WHERE email = ?",
            args: [email]
          });

          if (result.rows.length > 0) {
            const userRow = result.rows[0];
            const storedPasswordData = userRow.password_hash as string;
            
            // Check if it's the new format salt:hash
            let isValid = false;
            if (storedPasswordData.includes(':')) {
              const [salt, storedHash] = storedPasswordData.split(':');
              const computedHash = await hashPassword(password, salt);
              isValid = (computedHash === storedHash);
            } else {
              // Legacy fallback
              const msgUint8 = new TextEncoder().encode(password);
              const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
              const hashArray = Array.from(new Uint8Array(hashBuffer));
              const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
              isValid = (legacyHash === storedPasswordData);
            }

            if (isValid) {
              console.log("Turso authorization successful!");
              const token = await signToken({ userId: userRow.id, email }, JWT_SECRET);

              return new Response(JSON.stringify({
                success: true,
                message: "Authorized in Turso DB!",
                token: token,
                user: { id: userRow.id, email: userRow.email, name: userRow.name, institution: userRow.institution, major: userRow.major, session: userRow.session, role: userRow.role }
              }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            } else {
              return new Response(JSON.stringify({ error: "Invalid email or password" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            }
          } else {
            return new Response(JSON.stringify({ error: "Invalid email or password" }), {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        } catch (dbErr: any) {
          console.error("Turso connection failed:", dbErr.message || dbErr);
        }
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

  return null;
}
