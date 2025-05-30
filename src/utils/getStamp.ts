import { StampData, SupabaseStamp, UserStampsResponse } from '@/types';
import { createClient } from '@/utils/supabase/client';

export async function getUserStamps(
  username: string,
  isAuthorized: boolean
): Promise<UserStampsResponse> {
  const supabase = createClient();
  let dataToQuery = 'created_at, users!inner(username)';

  if (isAuthorized) {
    dataToQuery = 'notes, created_at, users!inner(username), mood';
  }

  // Fetch stamps using a left join on users table
  // Explicitly type the expected shape from Supabase
  const { data: supabaseData, error } = await supabase
    .from('stamps')
    .select<string, SupabaseStamp>(dataToQuery) // <-- Type Supabase response here
    .eq('users.username', username)
    .order('id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Transform Supabase data to your desired StampData format
  const transformedStamps: StampData[] = supabaseData
    ? supabaseData.map((stamp) => ({
        date: new Date(stamp.created_at), // Convert string to Date
        mood: stamp.mood,
        note: stamp.notes, // Map 'notes' to 'note'
      }))
    : [];

  return {
    success: true,
    message: 'Fetch Data Successful!',
    data: { stamps: transformedStamps },
  };
}
