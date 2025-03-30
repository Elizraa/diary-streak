import { createClient } from '@/utils/supabase/client';
import { hashPassword } from '@/utils/hashPassword';

export async function registerUser(username: string, pin: string) {
  const supabase = createClient();
  const hashedPin = hashPassword(pin);

  const { error } = await supabase
    .from('users')
    .insert([{ username, pin: hashedPin }]);

  return error ? `Error: ${error.message}` : 'User registered!';
}
