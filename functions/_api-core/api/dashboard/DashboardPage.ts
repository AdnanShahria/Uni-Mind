// API routes for DashboardPage
import { Client } from "@libsql/client/web";
import { corsHeaders, verifyToken } from "../../utils";

export const handleDashboardPageRoute = async (url: URL, request: Request, db: Client | null, env: any): Promise<Response | null> => {
  if (url.pathname === '/api/dashboard/data' && request.method === 'GET') {
    const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
    if (!payload) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = payload.userId;

    if (!db) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          stats: [],
          upcomingTasks: [],
          recentActivity: [],
          aiSuggestions: []
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // 1. Fetch Stats in parallel
      const [
        notesCountRes,
        notesWeekCountRes,
        aiQueriesCountRes,
        aiQueriesTodayCountRes,
        streakRes,
        connectionsCountRes,
        connectionsWeekCountRes
      ] = await Promise.all([
        db.execute({ sql: "SELECT COUNT(*) as count FROM notes WHERE author_id = ?", args: [userId] }),
        db.execute({ sql: "SELECT COUNT(*) as count FROM notes WHERE author_id = ? AND created_at >= ?", args: [userId, sevenDaysAgo] }),
        db.execute({
          sql: "SELECT COUNT(*) as count FROM ai_messages m JOIN ai_conversations c ON m.conversation_id = c.id WHERE c.user_id = ? AND m.role = 'user'",
          args: [userId]
        }),
        db.execute({
          sql: "SELECT COUNT(*) as count FROM ai_messages m JOIN ai_conversations c ON m.conversation_id = c.id WHERE c.user_id = ? AND m.role = 'user' AND m.created_at >= ?",
          args: [userId, oneDayAgo]
        }),
        db.execute({ sql: "SELECT study_streak FROM users WHERE id = ?", args: [userId] }),
        db.execute({
          sql: "SELECT COUNT(*) as count FROM connections WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'",
          args: [userId, userId]
        }),
        db.execute({
          sql: "SELECT COUNT(*) as count FROM connections WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted' AND created_at >= ?",
          args: [userId, userId, sevenDaysAgo]
        })
      ]);

      const notesCount = Number(notesCountRes.rows[0]?.count || 0);
      const notesWeekCount = Number(notesWeekCountRes.rows[0]?.count || 0);
      const aiQueriesCount = Number(aiQueriesCountRes.rows[0]?.count || 0);
      const aiQueriesTodayCount = Number(aiQueriesTodayCountRes.rows[0]?.count || 0);
      const streak = Number(streakRes.rows[0]?.study_streak || 0);
      const connectionsCount = Number(connectionsCountRes.rows[0]?.count || 0);
      const connectionsWeekCount = Number(connectionsWeekCountRes.rows[0]?.count || 0);

      const stats = [
        {
          label: 'Notes Uploaded',
          value: String(notesCount),
          change: `+${notesWeekCount} this week`,
          icon: 'StickyNote',
          color: 'from-amber-500/20 to-orange-500/20',
          borderColor: 'border-amber-500/20',
          iconColor: 'text-amber-400',
          changeColor: 'text-emerald-400',
          path: '/app/notes'
        },
        {
          label: 'AI Queries',
          value: String(aiQueriesCount),
          change: `+${aiQueriesTodayCount} today`,
          icon: 'Brain',
          color: 'from-purple-500/20 to-violet-500/20',
          borderColor: 'border-purple-500/20',
          iconColor: 'text-purple-400',
          changeColor: 'text-emerald-400',
          path: '/app/ai'
        },
        {
          label: 'Study Streak',
          value: String(streak),
          change: 'days straight 🔥',
          icon: 'Flame',
          color: 'from-rose-500/20 to-pink-500/20',
          borderColor: 'border-rose-500/20',
          iconColor: 'text-rose-400',
          changeColor: 'text-orange-400',
          path: '/app/planner'
        },
        {
          label: 'Connections',
          value: String(connectionsCount),
          change: `+${connectionsWeekCount} new peers`,
          icon: 'Users',
          color: 'from-cyan-500/20 to-teal-500/20',
          borderColor: 'border-cyan-500/20',
          iconColor: 'text-cyan-400',
          changeColor: 'text-emerald-400',
          path: '/app/communities'
        }
      ];

      // 2. Fetch Upcoming Tasks
      const tasksRes = await db.execute({
        sql: "SELECT * FROM tasks WHERE user_id = ? AND status = 'pending' ORDER BY due_date ASC LIMIT 4",
        args: [userId]
      });
      const upcomingTasks = tasksRes.rows.map((t: any) => {
        const d = new Date(t.due_date);
        return {
          id: t.id,
          title: t.title,
          date: isNaN(d.getTime()) ? '' : `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`,
          color: t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
        };
      });

      // 3. Fetch Recent Activity
      const activityRes = await db.execute(`
        SELECT p.*, u.name as author_name, u.role as author_role, u.avatar_url as author_avatar_url 
        FROM posts p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 5
      `);
      const recentActivity = activityRes.rows.map((post: any) => {
        const diff = Date.now() - new Date(post.created_at).getTime();
        const mins = Math.floor(diff / 60000);
        let timeStr = 'Just now';
        if (mins > 0) {
          timeStr = mins < 60 ? `${mins}m ago` : `${Math.floor(mins/60)}h ago`;
        }
        return {
          icon: post.type === 'document' ? 'FileText' : 'MessageCircle',
          title: post.content.substring(0, 40) + (post.content.length > 40 ? '...' : ''),
          subtitle: 'Academic Feed Post',
          time: timeStr,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          path: post.type === 'document' ? '/app/notes' : '/app/feed',
        };
      });

      // 4. Fetch/Generate AI Suggestions
      const suggestionsRes = await db.execute({
        sql: "SELECT * FROM ai_suggestions WHERE user_id = ? ORDER BY created_at DESC LIMIT 3",
        args: [userId]
      });

      let aiSuggestions = suggestionsRes.rows.map((s: any) => ({
        id: s.id,
        title: s.title,
        reason: s.reason,
        icon: s.icon,
        action: s.action,
        path: s.path
      }));

      if (aiSuggestions.length === 0) {
        const dynamicSuggestions: any[] = [];
        
        // Check tasks due within 3 days
        const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const dueTasksRes = await db.execute({
          sql: "SELECT title, due_date FROM tasks WHERE user_id = ? AND status = 'pending' AND due_date <= ? ORDER BY due_date ASC LIMIT 1",
          args: [userId, threeDaysFromNow]
        });
        if (dueTasksRes.rows.length > 0) {
          const task = dueTasksRes.rows[0];
          dynamicSuggestions.push({
            id: 'sugg-task',
            title: `Review "${task.title}"`,
            reason: 'This task is due soon. Focus on this to stay on track.',
            icon: 'Zap',
            action: 'Go to Planner',
            path: '/app/planner'
          });
        }

        // Check notes without flashcards
        const noteWithoutFlashcardsRes = await db.execute({
          sql: `
            SELECT n.id, n.title 
            FROM notes n 
            LEFT JOIN flashcards f ON n.id = f.note_id AND f.user_id = n.author_id
            WHERE n.author_id = ? AND f.id IS NULL 
            LIMIT 1
          `,
          args: [userId]
        });
        if (noteWithoutFlashcardsRes.rows.length > 0) {
          const note = noteWithoutFlashcardsRes.rows[0];
          dynamicSuggestions.push({
            id: 'sugg-note',
            title: `Generate Flashcards for "${note.title}"`,
            reason: 'Create active recall flashcards to lock in key concepts.',
            icon: 'BookOpen',
            action: 'Open Notes',
            path: '/app/notes'
          });
        }

        // Check peer connections count
        if (connectionsCount < 5) {
          dynamicSuggestions.push({
            id: 'sugg-conn',
            title: 'Grow Your Academic Network',
            reason: 'Connect with peers in your courses to share study guides and collaborate.',
            icon: 'Users',
            action: 'Find Peers',
            path: '/app/communities'
          });
        }

        // Standard fallback suggestions to ensure exactly 3 suggestions
        const fallbacks = [
          {
            id: 'sugg-fb1',
            title: 'Schedule Your Study Week',
            reason: 'Create upcoming tasks in the planner to build structured study habits.',
            icon: 'Zap',
            action: 'Go to Planner',
            path: '/app/planner'
          },
          {
            id: 'sugg-fb2',
            title: 'Upload Course Materials',
            reason: 'Add slides or lecture notes to generate custom study plans and mind maps.',
            icon: 'BookOpen',
            action: 'Upload Notes',
            path: '/app/notes'
          },
          {
            id: 'sugg-fb3',
            title: 'Explore Peer Communities',
            reason: 'Join active class forums or study groups to collaborate on projects.',
            icon: 'Users',
            action: 'Join Groups',
            path: '/app/communities'
          }
        ];

        for (const fb of fallbacks) {
          if (dynamicSuggestions.length >= 3) break;
          if (!dynamicSuggestions.some(s => s.icon === fb.icon)) {
            dynamicSuggestions.push(fb);
          }
        }
        for (const fb of fallbacks) {
          if (dynamicSuggestions.length >= 3) break;
          if (!dynamicSuggestions.some(s => s.id === fb.id)) {
            dynamicSuggestions.push(fb);
          }
        }

        aiSuggestions = dynamicSuggestions;
      }

      return new Response(JSON.stringify({
        success: true,
        data: {
          stats,
          upcomingTasks,
          recentActivity,
          aiSuggestions
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
      
    } catch (err: any) {
      console.error("Dashboard API Error:", err);
      return new Response(JSON.stringify({ error: err.message || "Failed to load dashboard data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }

  return null;
};

