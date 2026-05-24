import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.BYTEIT_SUPABASE_CONFIG || {};

export function getSupabaseConfig() {
  return config;
}

export function hasSupabaseConfig() {
  return Boolean(
    config.url &&
    config.anonKey &&
    !config.url.includes("YOUR_PROJECT_REF") &&
    !config.anonKey.includes("YOUR_SUPABASE")
  );
}

export const supabase = hasSupabaseConfig()
  ? createClient(config.url, config.anonKey)
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Update assets/js/byteit-supabase-config.js first.");
  }
  return supabase;
}

export async function getCurrentSchool() {
  const client = requireSupabase();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: school, error } = await client
    .from("schools")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (school) return { user, school };

  const schoolName = user.user_metadata?.school_name || user.email?.split("@")[0] || "School";
  const schoolEmail = user.email || user.user_metadata?.school_email;

  const { data: createdSchool, error: createError } = await client
    .from("schools")
    .insert({
      user_id: user.id,
      name: schoolName,
      email: schoolEmail
    })
    .select("*")
    .single();

  if (createError) throw createError;
  return { user, school: createdSchool };
}
