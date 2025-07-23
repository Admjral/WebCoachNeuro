import { createClient } from "@supabase/supabase-js"
import type { Database } from "./supabase.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side client (for API routes)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client-side client (for React components)
export const createClientComponentClient = () => createClient<Database>(supabaseUrl, supabaseAnonKey)

export type { Database } from "./supabase.types"
