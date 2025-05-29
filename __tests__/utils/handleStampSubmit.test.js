import { handleStampSubmit } from '../../src/utils/handleStampSubmit';
import { verifyUser } from '../../src/utils/verifyUser';
import {
  getUserStreak,
  updateUserStreak,
  createUserStreak,
} from '../../src/utils/streaks';
import { createClient } from '../../src/utils/supabase/client';

jest
  .mock('../../src/utils/supabase/client')
  .mock('bcryptjs', () => ({
    compareSync: jest.fn(),
  }))
  .mock('../../src/utils/streaks', () => ({
    getUserStreak: jest.fn(),
    updateUserStreak: jest.fn(),
    createUserStreak: jest.fn(),
  }))
  .mock('../../src/utils/verifyUser', () => ({
    verifyUser: jest.fn(),
  }));

jest.useFakeTimers().setSystemTime(new Date('2025-01-01'));

describe('handleStampSubmit', () => {
  let supabaseMock;
  const userData = { id: 1, pin: 'hashed_pin' };

  beforeEach(() => {
    supabaseMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn(),
    };
    createClient.mockReturnValue(supabaseMock);
  });

  it('should return error if verify user failed', async () => {
    verifyUser.mockRejectedValue(new Error('Invalid username or PIN'));

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: 'wrongpin',
    });

    expect(result).toEqual({
      success: false,
      message: 'Invalid username or PIN',
    });
    expect(verifyUser).toHaveBeenCalledTimes(1);
    expect(verifyUser).toHaveBeenCalledWith({
      username: 'testuser',
      pin: 'wrongpin',
    });
  });

  it('should return success if stamp is inserted correctly', async () => {
    verifyUser.mockResolvedValue(userData);
    const todayTimestamp = Date.now();
    const yesterdayTimestamp = new Date(
      todayTimestamp - 24 * 60 * 60 * 1000
    ).toISOString();
    getUserStreak.mockResolvedValue({
      success: true,
      streakData: { streak: 3, last_stamp: yesterdayTimestamp },
    });
    supabaseMock.insert.mockResolvedValue({ error: null });

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
      notes: 'Test note',
    });

    expect(result).toEqual({
      success: true,
      streak: 4,
      message: 'Stamped in successfully!',
    });
    expect(getUserStreak).toHaveBeenCalledWith(userData.id);
    expect(updateUserStreak).toHaveBeenCalledWith(userData.id, 4);
    expect(supabaseMock.insert).toHaveBeenCalledWith([
      {
        user_id: userData.id,
        notes: 'Test note',
        mood: null,
        created_at: new Date(todayTimestamp).toISOString(),
      },
    ]);
    expect(createUserStreak).not.toHaveBeenCalled();
  });

  it('should return reset stamp count if last stamp not yesterday', async () => {
    verifyUser.mockResolvedValue(userData);
    const todayTimestamp = Date.now();
    const twoDaysAgo = new Date(
      todayTimestamp - 24 * 2 * 60 * 60 * 1000
    ).toISOString();
    getUserStreak.mockResolvedValue({
      success: true,
      streakData: { streak: 3, last_stamp: twoDaysAgo },
    });
    supabaseMock.insert.mockResolvedValue({ error: null });

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
      notes: 'Test note',
    });

    expect(result).toEqual({
      success: true,
      streak: 1,
      message: 'Stamped in successfully!',
    });
  });

  it('should return error if stamp insertion fails', async () => {
    verifyUser.mockResolvedValue(userData);
    supabaseMock.insert.mockResolvedValue({
      error: { message: 'Insert failed' },
    });
    getUserStreak.mockResolvedValue({ success: true });

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
    });

    expect(result).toEqual({ success: false, message: 'Insert failed' });
  });

  it('should return alreadyStamped message if user has already stamped today', async () => {
    verifyUser.mockResolvedValue(userData);
    const todayTimestamp = Date.now();
    getUserStreak.mockResolvedValue({
      success: true,
      streakData: {
        streak: 3,
        last_stamp: new Date(todayTimestamp).toISOString(),
      },
    });

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
    });

    expect(result).toEqual({
      alreadyStamped: true,
      message: 'You have already stamped today!',
      success: false,
    });
  });

  it('should return error if random error occured', async () => {
    verifyUser.mockRejectedValue('Not an error object');

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
    });

    expect(result).toEqual({
      success: false,
      message: 'An unknown error occurred.',
    });
  });
});
