import { hashPassword, generateUUID, mockUsers, corsHeaders } from '../utils';

export async function handleAuthRoutes(url: URL, request: Request, db: any): Promise<Response | null> {
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

      const hashedPassword = await hashPassword(password);
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
              userId, email, hashedPassword, name, institution || '', 
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

      console.log(`Registering ${email} in local offline database fallback...`);
      if (mockUsers.has(email)) {
        return new Response(JSON.stringify({ error: "User already exists in database." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const newUser = {
        id: userId, email, name, institution, district, country, major, session, role, password: hashedPassword
      };
      mockUsers.set(email, newUser);

      return new Response(JSON.stringify({
        success: true,
        message: "Registered successfully in local fallback database (Offline Mode)!",
        user: { id: newUser.id, email: newUser.email, name: newUser.name, institution: newUser.institution, major: newUser.major, session: newUser.session, role: newUser.role }
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

      const hashedPassword = await hashPassword(password);

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
            const mockToken = btoa(JSON.stringify({ userId: userRow.id, email }));

            return new Response(JSON.stringify({
              success: true,
              message: "Authorized in Turso DB!",
              token: mockToken,
              user: { id: userRow.id, email: userRow.email, name: userRow.name, institution: userRow.institution, major: userRow.major, session: userRow.session, role: userRow.role }
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

      console.log(`Authorizing ${email} in local offline database fallback...`);
      let user = mockUsers.get(email);
      
      // Fallback for offline dev mode where isolate might have restarted and cleared mockUsers
      if (!user && !db) {
         user = { id: generateUUID(), email, name: 'Developer (Offline)', institution: 'Local', major: 'CS', role: 'Dev', password: hashedPassword };
         mockUsers.set(email, user);
      }
      
      if (user && user.password === hashedPassword) {
        const mockToken = btoa(JSON.stringify({ userId: user.id, email }));
        return new Response(JSON.stringify({
          success: true,
          message: "Authorized in local fallback database (Offline Mode)!",
          token: mockToken,
          user: { id: user.id, email: user.email, name: user.name, institution: user.institution, major: user.major, session: user.session, role: user.role }
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

  return null;
}
