import { generateUUID, verifyToken, corsHeaders } from '../utils';

import type { Env } from '../index';

export async function handleApiRoutes(url: URL, request: Request, db: any, env: Env): Promise<Response | null> {
  if (url.pathname === "/api/feed" && request.method === "GET") {
    try {
      if (db) {
        const result = await db.execute(`
          SELECT p.*, u.name as author_name, u.role as author_role, u.avatar_url as author_avatar_url 
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

  if (url.pathname.startsWith("/api/folders")) {
    const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
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

  if (url.pathname.startsWith("/api/notes")) {
    const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
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

  if (url.pathname.startsWith("/api/tasks")) {
    const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
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

  if (url.pathname.startsWith("/api/flashcards")) {
    const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
    if (!payload) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    try {
      if (request.method === "GET") {
        const noteId = url.searchParams.get("note_id");
        if (db) {
          let res;
          if (noteId) {
            res = await db.execute({
              sql: "SELECT * FROM flashcards WHERE user_id = ? AND note_id = ? ORDER BY created_at ASC",
              args: [payload.userId, noteId]
            });
          } else {
            res = await db.execute({
              sql: "SELECT * FROM flashcards WHERE user_id = ? ORDER BY created_at ASC",
              args: [payload.userId]
            });
          }
          return new Response(JSON.stringify({ success: true, data: res.rows }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ success: true, data: [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (request.method === "POST") {
        const body: any = await request.json();
        const items = Array.isArray(body) ? body : [body];
        
        if (db && items.length > 0) {
          for (const item of items) {
            const { note_id, question, answer, status } = item;
            const flashcardId = item.id || generateUUID();
            await db.execute({
              sql: `INSERT OR REPLACE INTO flashcards (
                id, note_id, user_id, question, answer, status
              ) VALUES (?, ?, ?, ?, ?, ?)`,
              args: [
                flashcardId, note_id, payload.userId, question, answer, status || 'new'
              ]
            });
          }
        }
        return new Response(JSON.stringify({ success: true, data: items }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      if (request.method === "PUT") {
        const body: any = await request.json();
        const { id, status } = body;
        
        if (!id) {
          return new Response(JSON.stringify({ error: "Flashcard ID is required" }), { status: 400, headers: corsHeaders });
        }
        if (db) {
          await db.execute({
            sql: "UPDATE flashcards SET status = ?, last_reviewed_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
            args: [status || 'new', id, payload.userId]
          });
        }
        return new Response(JSON.stringify({ success: true, data: { id, status } }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (request.method === "DELETE") {
        const flashcardId = url.searchParams.get("id");
        if (!flashcardId) {
          return new Response(JSON.stringify({ error: "Missing flashcard ID" }), { status: 400, headers: corsHeaders });
        }
        if (db) {
          await db.execute({
            sql: "DELETE FROM flashcards WHERE id = ? AND user_id = ?",
            args: [flashcardId, payload.userId]
          });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  return null;
}
