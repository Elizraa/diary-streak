import { UserFormData } from '@/types';
import { createClient } from '@/utils/supabase/client';
import bcrypt from 'bcryptjs';

export async function verifyUser(userFormData: UserFormData) {
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
