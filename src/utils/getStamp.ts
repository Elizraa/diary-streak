import { createClient } from '@/utils/supabase/client';

export async function getUserStamps(username: string) {
  const supabase = createClient();

  // Fetch stamps using a left join on users table
  const { data: stamps, error } = await supabase
    .from('stamps')
    .select('notes, created_at, users!inner(username)')
    .eq('users.username', username)
    .order('id', { ascending: false });

  if (error) {
    return { success: false, message: `Error: ${error.message}`, stamps: [] };
  }

  return { success: true, message: 'Stamped in successfully!', stamps };
}
