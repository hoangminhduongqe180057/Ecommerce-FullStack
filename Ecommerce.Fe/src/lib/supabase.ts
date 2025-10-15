// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// TODO: Thay thế bằng credentials thực tế từ Supabase Dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rioqfyejijcvdteaglzo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpb3FmeWVqaWpjdmR0ZWFnbHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTgyMjYsImV4cCI6MjA3NTYzNDIyNn0.7tNhV8j2NlLjJ-kB6NN_SMhMBXbDpwFTENWRO8X8Vfg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
