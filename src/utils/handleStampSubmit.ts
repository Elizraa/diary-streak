import { createClient } from '@/utils/supabase/client';
import bcrypt from 'bcryptjs';
import { createUserStreak, getUserStreak, updateUserStreak } from './streaks';

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

  let streak;

  if (userError || !user || !bcrypt.compareSync(formData.pin, user.pin)) {
    return { success: false, message: 'Invalid username or PIN' };
  }

  const streakResponse = await getUserStreak(user.id);

  if (!streakResponse.success) {
    return { success: false, message: streakResponse.message };
  }

  const { streakData } = streakResponse;
  if (streakData) {
    const lastStamp = new Date(streakData.last_stamp); // Convert Supabase timestamptz to JS Date
    const today = new Date();

    const diffMs = today.getTime() - lastStamp.getTime(); // Use getTime() to get numbers
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { success: false, message: 'You have already stamped today!' };
    }

    streak = diffDays === 1 ? streakData.streak + 1 : 1; // Increment streak only if last stamp was yesterday
    const updateStreakResponse = await updateUserStreak(user.id, streak);

    if (updateStreakResponse && !updateStreakResponse.success) {
      return { success: false, message: updateStreakResponse.message };
    }
  }

  if (!streakData) {
    const createStreakResponse = await createUserStreak(user.id);
    if (createStreakResponse && !createStreakResponse.success) {
      return { success: false, message: createStreakResponse.message };
    }
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

  return { success: true, message: 'Stamped in successfully!', streak };
}
