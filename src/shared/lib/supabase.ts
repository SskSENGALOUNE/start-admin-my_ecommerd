import { createClient } from "@supabase/supabase-js";

// Supabase anon key ปลอดภัยที่จะ expose ใน browser
// (Row Level Security ปกป้องข้อมูล, anon key ออกแบบมาให้ public)
const SUPABASE_URL = "https://rkggshkkkgkhhamjwify.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZ2dzaGtra2draGhhbWp3aWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjkzODIsImV4cCI6MjA5MzI0NTM4Mn0.RNJpPDd8DmY_-qWZM4vy9nyBFuLNYYMpK5N3gPY-S3k";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Redirect URL หลัง Google OAuth */
export const OAUTH_REDIRECT_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/customer/auth/callback`
    : "http://localhost:3000/customer/auth/callback";
