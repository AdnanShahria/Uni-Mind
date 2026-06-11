import { verifyToken, corsHeaders } from '../utils';
import type { Env } from '../index';

export async function handleDynamicRoute(url: URL, request: Request, db: any, env: Env): Promise<Response | null> {
  console.log("DYNAMIC HANDLER CALLED for URL:", url.pathname);
  const pathParts = url.pathname.split('/');
  if (pathParts.length === 4 && pathParts[1] === 'api' && pathParts[2] === 'dynamic') {
    const table = pathParts[3];
    const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
    
    // These tables allow public read (GET) without authentication
    const publicReadTables = ['post_likes', 'post_comments', 'post_shares', 'ai_prompts', 'ai_suggestions', 'users'];
    const isPublicRead = request.method === 'GET' && publicReadTables.includes(table);

    // Only logged in users can access dynamic routes, except public GETs
    if (!payload && !isPublicRead) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Basic table name validation to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      return new Response(JSON.stringify({ error: "Invalid table name" }), { status: 400, headers: corsHeaders });
    }

    try {
      if (request.method === "GET") {
        const urlObj = new URL(request.url);
        let sql = `SELECT * FROM ${table}`;
        if (table === 'users') {
          sql = `SELECT id, name, institution, major, role, session, district, country, avatar_url, knowledge_score, study_streak, badges, created_at FROM ${table}`;
        }
        let args: any[] = [];
        let whereClauses: string[] = [];

        // RLS for GET
        if (payload) {
          if (table === 'notes') {
            whereClauses.push(`(author_id = ? OR community_id IS NOT NULL)`);
            args.push(payload.userId);
          } else if (table === 'folders') {
            whereClauses.push(`(user_id = ? OR community_id IS NOT NULL)`);
            args.push(payload.userId);
          } else if ([
            'tasks', 'weekly_goals', 'long_term_goals', 'user_preferences', 
            'flashcards', 'notifications', 'api_keys', 'research_papers', 
            'research_collaborators', 'ai_suggestions', 'ai_conversations'
          ].includes(table)) {
            whereClauses.push(`user_id = ?`);
            args.push(payload.userId);
          } else if (table === 'connections') {
            whereClauses.push(`(user_id = ? OR friend_id = ?)`);
            args.push(payload.userId);
            args.push(payload.userId);
          } else if (table === 'conversations') {
            whereClauses.push(`id IN (SELECT conversation_id FROM conversation_members WHERE user_id = ?)`);
            args.push(payload.userId);
          } else if (table === 'ai_messages') {
            whereClauses.push(`conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = ?)`);
            args.push(payload.userId);
          }
        }
        
        // Backward compatibility
        const eqColumn = urlObj.searchParams.get("eqColumn");
        const eqValue = urlObj.searchParams.get("eqValue");
        if (eqColumn && eqValue && /^[a-zA-Z0-9_]+$/.test(eqColumn)) {
          whereClauses.push(`${eqColumn} = ?`);
          args.push(eqValue);
        }

        // Dynamic filters
        urlObj.searchParams.forEach((val, key) => {
          if (key.startsWith('eq_')) {
            const col = key.replace('eq_', '');
            if (/^[a-zA-Z0-9_]+$/.test(col)) {
              if (val === 'null') {
                whereClauses.push(`${col} IS NULL`);
              } else {
                whereClauses.push(`${col} = ?`);
                args.push(val);
              }
            }
          } else if (key.startsWith('neq_')) {
            const col = key.replace('neq_', '');
            if (/^[a-zA-Z0-9_]+$/.test(col)) {
              if (val === 'null') {
                whereClauses.push(`${col} IS NOT NULL`);
              } else {
                whereClauses.push(`${col} != ?`);
                args.push(val);
              }
            }
          } else if (key.startsWith('ilike_')) {
            const col = key.replace('ilike_', '');
            if (/^[a-zA-Z0-9_]+$/.test(col)) {
              whereClauses.push(`${col} LIKE ?`);
              args.push(`%${val}%`);
            }
          }
        });

        if (whereClauses.length > 0) {
          sql += ` WHERE ` + whereClauses.join(' AND ');
        }

        const orderCol = urlObj.searchParams.get("order");
        const orderDir = urlObj.searchParams.get("dir") === 'asc' ? 'ASC' : 'DESC';
        if (orderCol && /^[a-zA-Z0-9_]+$/.test(orderCol)) {
          sql += ` ORDER BY ${orderCol} ${orderDir}`;
        }

        const limitCount = urlObj.searchParams.get("limit");
        if (limitCount && !isNaN(Number(limitCount))) {
          sql += ` LIMIT ?`;
          args.push(Number(limitCount));
        }
        
        if (db) {
          const res = await db.execute({ sql, args });
          return new Response(JSON.stringify({ success: true, data: res.rows }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ success: true, data: [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (request.method === "POST" || request.method === "PUT") {
        const body: any = await request.json();
        
        // For updates, we expect an ID or user_id for user_preferences
        const isUserPrefs = table === 'user_preferences';
        const primaryKeyCol = isUserPrefs ? 'user_id' : 'id';
        const primaryKeyValue = body[primaryKeyCol];
        if (request.method === "PUT") {
            // It's a partial update
            if (!primaryKeyValue) {
                return new Response(JSON.stringify({ error: `Missing ${primaryKeyCol} for update` }), { status: 400, headers: corsHeaders });
            }
            const updateKeys = Object.keys(body).filter(k => k !== primaryKeyCol);
            if (updateKeys.length === 0) {
                 return new Response(JSON.stringify({ success: true, data: body }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
            
            // Validate keys
            for (const key of updateKeys) {
               if (!/^[a-zA-Z0-9_]+$/.test(key)) {
                   return new Response(JSON.stringify({ error: "Invalid column name" }), { status: 400, headers: corsHeaders });
               }
            }
            
            const setClause = updateKeys.map(k => `${k} = ?`).join(', ');
            const args = updateKeys.map(k => body[k]);
            args.push(primaryKeyValue);
            
            // RLS
            let rlsClause = '';
            if (table === 'posts' || table === 'post_comments') {
                rlsClause = ` AND author_id = ?`;
                args.push(payload.userId);
            } else if (table === 'notes') {
                rlsClause = ` AND (author_id = ? OR community_id IS NOT NULL)`;
                args.push(payload.userId);
            } else if (table === 'communities') {
                rlsClause = ` AND created_by = ?`;
                args.push(payload.userId);
            } else if (table === 'users') {
                rlsClause = ` AND id = ?`;
                args.push(payload.userId);
            } else if (table === 'messages') {
                rlsClause = ` AND sender_id = ?`;
                args.push(payload.userId);
            } else if (table === 'conversations') {
                rlsClause = ` AND id IN (SELECT conversation_id FROM conversation_members WHERE user_id = ?)`;
                args.push(payload.userId);
            } else if (!isUserPrefs && table !== 'ai_prompts' && table !== 'metadata_approved') {
                // Generic fallback for tables with user_id
                rlsClause = ` AND user_id = ?`;
                args.push(payload.userId);
            }

            if (db) {
                await db.execute({
                    sql: `UPDATE ${table} SET ${setClause} WHERE ${primaryKeyCol} = ?${rlsClause}`,
                    args: args
                });
            }
            return new Response(JSON.stringify({ success: true, data: body }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } else {
            // It's an INSERT
            // Inject author_id or user_id for security
            // Tables that use author_id
            if (table === 'posts' || table === 'notes' || table === 'post_comments') {
                 if (!body.author_id) body.author_id = payload.userId;
            } else if (table === 'communities') {
                 if (!body.created_by) body.created_by = payload.userId;
            } else if (table === 'ai_messages' || table === 'ai_prompts' || table === 'conversations') {
                 // These tables don't have a user_id column — skip injection
            } else if (table === 'messages') {
                 if (!body.sender_id) body.sender_id = payload.userId;
            } else {
                 if (!body.user_id) body.user_id = payload.userId;
            }

            if (isUserPrefs) {
                // Check if user preferences exist to handle upsert (insert or update)
                if (db) {
                    const exists = await db.execute({
                        sql: `SELECT 1 FROM user_preferences WHERE user_id = ?`,
                        args: [body.user_id]
                    });
                    if (exists.rows.length > 0) {
                        const updateKeys = Object.keys(body).filter(k => k !== 'user_id');
                        const setClause = updateKeys.map(k => `${k} = ?`).join(', ');
                        const args = updateKeys.map(k => body[k]);
                        args.push(body.user_id);
                        await db.execute({
                            sql: `UPDATE user_preferences SET ${setClause} WHERE user_id = ?`,
                            args: args
                        });
                        return new Response(JSON.stringify({ success: true, data: body }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
                    }
                }
            }

            const tablesWithoutId = ['community_members', 'post_likes', 'conversation_members', 'user_preferences'];
            if (!body.id && !tablesWithoutId.includes(table)) {
                 body.id = crypto.randomUUID();
            }

            const keys = Object.keys(body);
            // Validate keys
            for (const key of keys) {
               if (!/^[a-zA-Z0-9_]+$/.test(key)) {
                   return new Response(JSON.stringify({ error: "Invalid column name" }), { status: 400, headers: corsHeaders });
               }
            }
            const placeholders = keys.map(() => '?').join(', ');
            const args = keys.map(k => body[k]);
            
            if (db) {
                await db.execute({
                    sql: `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
                    args: args
                });
            }
            return new Response(JSON.stringify({ success: true, data: body }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      if (request.method === "DELETE") {
        let whereClauses: string[] = [];
        let args: any[] = [];
        
        const eqColumn = url.searchParams.get("eqColumn");
        const eqValue = url.searchParams.get("eqValue");
        if (eqColumn && eqValue && /^[a-zA-Z0-9_]+$/.test(eqColumn)) {
            whereClauses.push(`${eqColumn} = ?`);
            args.push(eqValue);
        }

        url.searchParams.forEach((val, key) => {
          if (key.startsWith('eq_')) {
            const col = key.replace('eq_', '');
            if (/^[a-zA-Z0-9_]+$/.test(col)) {
              whereClauses.push(`${col} = ?`);
              args.push(val);
            }
          }
        });

        if (whereClauses.length === 0) {
            return new Response(JSON.stringify({ error: "Missing delete conditions" }), { status: 400, headers: corsHeaders });
        }

        // RLS
        let rlsClause = '';
        if (table === 'posts' || table === 'notes' || table === 'post_comments') {
            rlsClause = ` AND author_id = ?`;
            args.push(payload.userId);
        } else if (table === 'communities') {
            rlsClause = ` AND created_by = ?`;
            args.push(payload.userId);
        } else if (table === 'users') {
            rlsClause = ` AND id = ?`;
            args.push(payload.userId);
        } else if (table === 'messages') {
            rlsClause = ` AND sender_id = ?`;
            args.push(payload.userId);
        } else if (table === 'conversations') {
            rlsClause = ` AND id IN (SELECT conversation_id FROM conversation_members WHERE user_id = ?)`;
            args.push(payload.userId);
        } else if (table !== 'ai_prompts' && table !== 'metadata_approved') {
            // Generic fallback for tables with user_id
            rlsClause = ` AND user_id = ?`;
            args.push(payload.userId);
        }

        if (db) {
            await db.execute({
                sql: `DELETE FROM ${table} WHERE ` + whereClauses.join(' AND ') + rlsClause,
                args: args
            });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

    } catch (err: any) {
      console.error(`Dynamic API error [${table}]:`, err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  return null;
}
