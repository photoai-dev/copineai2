export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.copineai.com";

export const SITE_NAME = "CopineAI";

// Même projet Supabase que love20 (ancien SPA) — clé anon publique, sans risque à committer.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://allbwtoexfxupksbvfnh.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbGJ3dG9leGZ4dXBrc2J2Zm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDY1NDgsImV4cCI6MjEwNjg4MjU0OH0.XwJ6ZomN3tHgqaQqkQc_np86D0hsIteZcjxDeM1Ami8";
