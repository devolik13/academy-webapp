// api/update.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vuzrbgtczuprgnysdbyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1enJiZ3RjenVwcmdueXNkYnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzU0NzQsImV4cCI6MjA3MDMxMTQ3NH0.OunYZc1E26onsgCI8yNdpr-DOEcASxDGbFmvlfjFgCc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, crystals, mana } = req.body;

  try {
    const { error } = await supabase
      .from('users')
      .update({ crystals, mana })
      .eq('id', user_id);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}