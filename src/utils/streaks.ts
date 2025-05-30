import { StreakData } from '@/types';
import { createClient } from '@/utils/supabase/client';

export async function getUserStreak(userId: string) {
  const supabase = createClient();

  const { data: streakData, error } = await supabase
    .from('streaks')
    .select('streak, last_stamp')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return { streakData };
}

export async function updateUserStreak(userId: string, streak: number) {
  const today = new Date();
  const supabase = createClient();
  const { error: updateError } = await supabase
    .from('streaks')
    .update({
      streak: streak,
      last_stamp: today.toISOString(),
    })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating streak:', updateError.message);
    throw new Error(updateError.message);
  }
}

export async function createUserStreak(userId: string) {
  const today = new Date();
  const supabase = createClient();
  const { error: insertError } = await supabase
    .from('streaks')
    .insert([
      {
        user_id: userId,
        streak: 1,
        last_stamp: today.toISOString(),
      },
    ])
    .single();

  if (insertError) {
    console.error('Error creating streak:', insertError.message);
    throw new Error(insertError.message);
  }
}

// get user streak by username
export async function getUserStreakByUsername(username: string) {
  const supabase = createClient();

  const { data: streakData, error } = await supabase
    .from('streaks')
    .select<string, StreakData>('streak, last_stamp, users!inner(username)')
    .eq('users.username', username)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { streakData };
}
