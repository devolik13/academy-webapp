// api/user.js — Прокси-функция для получения данных игрока
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vuzrbgtczuprgnysdbyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1enJiZ3RjenVwcmdueXNkYnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzU0NzQsImV4cCI6MjA3MDMxMTQ3NH0.OunYZc1E26onsgCI8yNdpr-DOEcASxDGbFmvlfjFgCc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', parseInt(user_id))
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}