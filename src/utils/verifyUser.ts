import { createClient } from '@/utils/supabase/client';
import bcrypt from 'bcryptjs';

interface userFormData {
  username: string;
  pin: string;
}

export async function verifyUser(userFormData: userFormData) {
  const supabase = createClient();
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, pin')
    .eq('username', userFormData.username)
    .single();

  if (userError || !user || !bcrypt.compareSync(userFormData.pin, user.pin)) {
    throw new Error('Invalid username or PIN');
  }

  return user;
}
