import { createClient } from '@/utils/supabase/client';
import { createUserStreak, getUserStreak, updateUserStreak } from './streaks';
import { verifyUser } from './verifyUser';

interface FormData {
  username: string;
  pin: string;
  notes?: string;
  mood?: string | null;
}

export async function handleStampSubmit(formData: FormData) {
  try {
    const supabase = createClient();
    const user = await verifyUser({
      username: formData.username,
      pin: formData.pin,
    });

    let streak;

    const streakResponse = await getUserStreak(user.id);

    if (!streakResponse.success) {
      return { success: false, message: streakResponse.message };
    }

    const { streakData } = streakResponse;
    if (streakData) {
      console.log('streakData.last_stamp :>> ', streakData.last_stamp);
      const lastStamp = new Date(streakData.last_stamp); // Convert Supabase timestamptz to JS Date
      const today = new Date();

      const diffMs = today.getTime() - lastStamp.getTime(); // Use getTime() to get numbers
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      console.log('today :>> ', today);
      console.log('lastStamp :>> ', lastStamp);
      if (diffDays === 0) {
        return {
          success: false,
          message: 'You have already stamped today!',
          alreadyStamped: true,
        };
      }
      console.log('diffDays :>> ', diffDays);
      streak = diffDays === 1 ? streakData.streak + 1 : 1; // Increment streak only if last stamp was yesterday
      await updateUserStreak(user.id, streak);
    }

    if (!streakData) {
      await createUserStreak(user.id);
      streak = 1; // Start a new streak if no previous data exists
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
      throw new Error(stampError.message);
    }

    return { success: true, message: 'Stamped in successfully!', streak };
  } catch (error) {
    console.error('Error handling stamp submit:', error);

    if (error instanceof Error) {
      return { success: false, message: `${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}
