import { generateUUID, mockMetadataRequests, corsHeaders } from '../utils';

export async function handleMetadataRoutes(url: URL, request: Request, db: any): Promise<Response | null> {
  if (url.pathname === "/api/metadata/approved" && request.method === "GET") {
    try {
      let cache: any = null;
      let cacheKey: Request | null = null;
      
      if (typeof caches !== 'undefined') {
        const cacheUrl = new URL(request.url);
        cacheKey = new Request(cacheUrl.toString(), request);
        cache = (caches as any).default;
        if (cache) {
          const cachedResponse = await cache.match(cacheKey);
          if (cachedResponse) {
            return cachedResponse;
          }
        }
      }

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

      const response = new Response(
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
            "Cache-Control": "public, s-maxage=60, max-age=30"
          }
        }
      );

      if (cache && cacheKey) {
        await cache.put(cacheKey, response.clone());
      }

      return response;
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }

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

  return null;
}
