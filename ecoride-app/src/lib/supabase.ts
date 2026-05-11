import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ztllbegohvenuunlezuh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pTWlpJ1nWjCTN2dsE5CRCw_GSea3gsR';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
