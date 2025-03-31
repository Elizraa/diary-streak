import { createClient } from '@/utils/supabase/client';
import { hashPin } from '@/utils/hashPin';

export async function registerUser(username: string, pin: string) {
  const supabase = createClient();
  const hashedPin = hashPin(pin);

  const { error } = await supabase
    .from('users')
    .insert([{ username, pin: hashedPin }]);

  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, message: 'User Registered' };
}
