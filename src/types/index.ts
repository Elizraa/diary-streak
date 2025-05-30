// Type for calendar day data
export type StampData = {
  date: Date;
  mood?: 'happy' | 'sad' | null;
  note?: string;
};

// Type for monthly data
export type MonthData = {
  month: string;
  year: number;
  days: DayData[];
};

export type StreakData = {
  streak: number;
  last_stamp: string;
};

export type DayData = StampData & {};

export type SupabaseStamp = {
  created_at: string; // Supabase returns ISO string for timestamps
  mood?: 'happy' | 'sad' | null;
  notes?: string; // Assuming 'notes' is the column name for 'note'
  // users field is not directly part of StampData, it's for the query
};

export type UserStampsResponse = {
  success: boolean;
  message: string;
  data: { stamps: StampData[] }; // This is the final shape you want
};

export type UserFormData = {
  username: string;
  pin: string;
};

export type FormData = UserFormData & {
  notes?: string;
  mood?: string | null;
};

export type StampDataForm = {
  username: string;
  streak: number;
  timestamp: number;
  mood: string | null;
};
