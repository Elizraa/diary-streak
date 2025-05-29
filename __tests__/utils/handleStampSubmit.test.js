import { handleStampSubmit } from '../../src/utils/handleStampSubmit';
import { verifyUser } from '../../src/utils/verifyUser';
import {
  getUserStreak,
  updateUserStreak,
  createUserStreak,
} from '../../src/utils/streaks';
import { createClient } from '../../src/utils/supabase/client';
import bcrypt from 'bcryptjs';

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
    jest.spyOn(Date, 'now').mockReturnValue(todayTimestamp);
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
  });

  it('should return error if stamp insertion fails', async () => {
    verifyUser.mockResolvedValue(userData);
    supabaseMock.insert.mockResolvedValue({
      error: { message: 'Insert failed' },
    });
    getUserStreak.mockResolvedValue({
      success: true,
      streakData: { streak: 1 },
    });

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
    });

    expect(result).toEqual({ success: false, message: 'Insert failed' });
  });
});
