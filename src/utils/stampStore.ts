// A simple client-side store for stamp data
// In a real app, you might use a more robust state management solution

type StampData = {
  username: string;
  stamp: number;
  timestamp: number;
  mood: string | null;
};

// Store stamp data in sessionStorage
export const storeStampData = (data: StampData): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('dairyStampData', JSON.stringify(data));
  }
};

// Retrieve stamp data from sessionStorage
export const getStampData = (): StampData | null => {
  if (typeof window !== 'undefined') {
    const data = sessionStorage.getItem('dairyStampData');
    if (data) {
      return JSON.parse(data);
    }
  }
  return null;
};

// Clear stamp data from sessionStorage
export const clearStampData = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('dairyStampData');
  }
};

// Check if stamp data is valid (exists and is recent)
export const isStampDataValid = (): boolean => {
  const data = getStampData();
  if (!data) return false;

  // Check if the data is recent (within the last 5 minutes)
  const now = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000;
  return now - data.timestamp < fiveMinutesInMs;
};
