import { createClient } from '@/utils/supabase/client';
import bcrypt from 'bcryptjs';

interface FormData {
  username: string;
  pin: string;
  notes?: string;
  mood?: string | null;
}

export async function handleStampSubmit(formData: FormData) {
  const supabase = createClient();
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, pin')
    .eq('username', formData.username)
    .single();

  if (userError || !user || !bcrypt.compareSync(formData.pin, user.pin)) {
    return { success: false, message: 'Invalid username or PIN' };
  }

  const { error: stampError } = await supabase.from('stamps').insert([
    {
      user_id: user.id,
      notes: formData.notes || null,
      mood: formData.mood || null,
      created_at: new Date().toISOString(),
    },
  ]);

  if (stampError) {
    return { success: false, message: `Error: ${stampError.message}` };
  }

  return { success: true, message: 'Stamped in successfully!' };
}
