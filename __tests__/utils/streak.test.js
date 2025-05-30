import {
  getUserStreak,
  updateUserStreak,
  getUserStreakByUsername,
} from '../../src/utils/streaks';
import { createClient } from '../../src/utils/supabase/client';

jest.mock('../../src/utils/supabase/client');

let supabaseMock;
jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));

describe('#getUserStreak', () => {
  const userId = '1234';

  beforeEach(() => {
    supabaseMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };
    createClient.mockReturnValue(supabaseMock);
  });

  it('should return the current streak for a user', async () => {
    const mockResponse = {
      data: { streak: 5, last_stamp: '2023-10-01T00:00:00Z' },
      error: null,
    };
    supabaseMock.maybeSingle.mockResolvedValue(mockResponse);

    const result = await getUserStreak(userId);

    const { streakData } = result;
    expect(streakData.streak).toEqual(5);
    expect(supabaseMock.from).toHaveBeenCalledWith('streaks');
    expect(supabaseMock.select).toHaveBeenCalledWith('streak, last_stamp');
    expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', userId);
    expect(supabaseMock.maybeSingle).toHaveBeenCalled();
  });

  it('should throw an error if supabase returns an error', async () => {
    const mockError = { message: 'Database error' };
    supabaseMock.maybeSingle.mockResolvedValue({
      data: null,
      error: mockError,
    });

    await expect(getUserStreak(userId)).rejects.toThrow('Database error');
  });
});

describe('#updateUserStreak', () => {
  const userId = '1234';

  beforeEach(() => {
    supabaseMock = {
      from: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn(),
    };
    createClient.mockReturnValue(supabaseMock);
  });

  it('should update the user streak in the database', async () => {
    const newStreak = 6;
    const today = new Date().toISOString();
    supabaseMock.eq = jest.fn().mockResolvedValue({});

    await updateUserStreak(userId, newStreak);

    expect(supabaseMock.from).toHaveBeenCalledWith('streaks');
    expect(supabaseMock.update).toHaveBeenCalledWith({
      streak: newStreak,
      last_stamp: today,
    });
    expect(supabaseMock.eq).toHaveBeenCalledWith('user_id', userId);
  });

  it('should throw an error if supabase update fails', async () => {
    const mockError = { error: { message: 'Update failed' } };
    supabaseMock.eq = jest.fn().mockResolvedValue(mockError);

    await expect(updateUserStreak(userId, 6)).rejects.toThrow('Update failed');
  });
});

describe('#getUserStreakByUsername', () => {
  const username = 'testuser';

  beforeEach(() => {
    supabaseMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    createClient.mockReturnValue(supabaseMock);
  });

  it('should return the streak for a user by username', async () => {
    const mockResponse = {
      data: { streak: 3, last_stamp: new Date().toISOString() },
      error: null,
    };
    supabaseMock.single.mockResolvedValue(mockResponse);

    const result = await getUserStreakByUsername(username);

    const { streakData } = result;
    expect(streakData.streak).toEqual(3);
    expect(supabaseMock.from).toHaveBeenCalledWith('streaks');
    expect(supabaseMock.select).toHaveBeenCalledWith(
      'streak, last_stamp, users!inner(username)'
    );
    expect(supabaseMock.eq).toHaveBeenCalledWith('users.username', username);
    expect(supabaseMock.single).toHaveBeenCalled();
  });

  it('should throw an error if supabase returns an error', async () => {
    const mockError = { message: 'Database error' };
    supabaseMock.single.mockResolvedValue({
      data: null,
      error: mockError,
    });

    await expect(getUserStreakByUsername(username)).rejects.toThrow(
      'Database error'
    );
  });
});
