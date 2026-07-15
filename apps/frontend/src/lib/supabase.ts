import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isUrlValid = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

console.log("VITE_SUPABASE_URL =", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY exists =", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = () => {
  console.log("URL valid:", isUrlValid(supabaseUrl));
  console.log("URL:", supabaseUrl);
  console.log("Anon exists:", !!supabaseAnonKey);

  return (
    isUrlValid(supabaseUrl) &&
    !!supabaseAnonKey &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseAnonKey.includes("placeholder")
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Auto-detect & exchange the #access_token hash fragment on callback
        detectSessionInUrl: true,
        // PKCE is the most secure and reliable flow for SPAs
        flowType: 'pkce',
      },
    })
  : ({
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signUp: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { session: null }, error: null }),
        signInWithOAuth: async ({ provider }: { provider: string }) => {
          return { data: null, error: { message: 'MOCK_FALLBACK', status: 400 } as any };
        },
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_event: any, callback: any) => {
          // no-op for mock
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
      },
    } as any);
