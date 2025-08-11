// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vuzrbgtczuprgnysdbyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1enJiZ3RjenVwcmdueXNkYnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzU0NzQsImV4cCI6MjA3MDMxMTQ3NH0.OunYZc1E26onsgCI8yNdpr-DOEcASxDGbFmvlfjFgCc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { supabase };
