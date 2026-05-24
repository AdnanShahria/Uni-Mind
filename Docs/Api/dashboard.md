# Dashboard Data Architecture

This document explains how the **Dashboard** in UniMind pulls its data from the Supabase backend while maintaining a robust offline/fallback experience.

## Overview
The Dashboard (`DashboardPage.tsx`) acts as the central hub of the academic ecosystem. It is designed to display a personalized greeting, aggregate high-level metrics, suggest AI actions, and list the user's recent academic activity.

## Data Fetching Strategy

The Dashboard utilizes the `@supabase/supabase-js` client to fetch data asynchronously via a `useEffect` hook.

### 1. User Profile Resolution
When the dashboard mounts, it calls `supabase.auth.getUser()`. 
- If a user is logged in, it dynamically updates the greeting (e.g., *Welcome back, Adnan Shahria 👋*).
- If no user is logged in (or if the query fails), it gracefully falls back to the default "Welcome back, Scholar".

### 2. Recent Activity Feed
The "Recent Activity" section displays the most recent academic events (currently, posts). 
The data is fetched using:
```typescript
const { data: posts } = await supabase
  .from('posts')
  .select('content, created_at, type')
  .order('created_at', { ascending: false })
  .limit(5);
```
- **Parsing**: The posts are parsed into a standardized `recentActivity` object format, extracting the first 40 characters of the content for the title, and calculating a relative timestamp (e.g., "10m ago").
- **Mock Data Fallback**: We enforce a strict fallback mechanism. If the `posts` array is empty (i.e. a brand new database with no user activity), the dashboard dynamically assigns a rich predefined array of mock data (`recentActivity`). This ensures the UI always remains beautifully populated, preserving the "wow" factor during demos or initial onboarding.

### 3. Future Integrations (Mocked State)
Currently, certain elements of the dashboard rely purely on initial mock data, pending future feature rollouts:
- **Stats Grid**: Metrics like "Notes Uploaded", "AI Queries", and "Study Streak" are static. Once the `notes` and `ai_interactions` tables are fully populated by users, we will update the data fetcher to run `COUNT()` aggregations on these tables.
- **AI Suggestions & Upcoming Tasks**: These are static placeholders. In a future update, "Upcoming Tasks" will query the user's calendar/planner database schemas.
