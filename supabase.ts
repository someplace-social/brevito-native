import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // must be first

const SUPABASE_URL = 'https://txuxvwespilcmnngbfik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4dXh2d2VzcGlsY21ubmdiZmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDI3NTMsImV4cCI6MjA3NjM3ODc1M30.6h1s_vAvQk4qgsX_7q1ZoTmVsw4iCmukbXFMGd1cDSo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    detectSessionInUrl: false,
  },
});