import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

const isPlaceholder = (val: string) => {
  return !val || val.includes('your_') || val.includes('placeholder') || val.includes('here');
};

// Initialize Supabase Client ONLY if real credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey && !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn('Supabase URL/Key missing or using default placeholders. OpenDrama is running in Local Database Fallback mode.');
}
