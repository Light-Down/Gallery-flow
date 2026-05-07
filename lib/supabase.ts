/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createClient(url, anonKey);
  }
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    _supabaseAdmin = createClient(url, serviceKey);
  }
  return _supabaseAdmin;
}

// Backwards-compatible named exports (lazy)
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => getSupabase()[prop as keyof SupabaseClient],
});

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_, prop) => getSupabaseAdmin()[prop as keyof SupabaseClient],
});
