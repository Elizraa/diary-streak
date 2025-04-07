import { handleStampSubmit } from '../../src/utils/handleStampSubmit';
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

  it('should return error if user not found', async () => {
    supabaseMock.single.mockResolvedValue({
      data: null,
      error: { message: 'User not found' },
    });

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
    });

    expect(result).toEqual({
      success: false,
      message: 'Invalid username or PIN',
    });
  });

  it('should return error if PIN is incorrect', async () => {
    supabaseMock.single.mockResolvedValue({
      data: userData,
    });
    bcrypt.compareSync.mockReturnValue(false);

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: 'wrongpin',
    });

    expect(result).toEqual({
      success: false,
      message: 'Invalid username or PIN',
    });
  });

  it('should return success if stamp is inserted correctly', async () => {
    supabaseMock.single.mockResolvedValue({
      data: userData,
    });
    bcrypt.compareSync.mockReturnValue(true);
    getUserStreak.mockResolvedValue({ success: true, streak: 0 });
    supabaseMock.insert.mockResolvedValue({ error: null });

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
      notes: 'Test note',
    });

    expect(result).toEqual({
      success: true,
      message: 'Stamped in successfully!',
    });
  });

  it('should return error if stamp insertion fails', async () => {
    supabaseMock.single.mockResolvedValue({
      data: userData,
    });
    bcrypt.compareSync.mockReturnValue(true);
    supabaseMock.insert.mockResolvedValue({
      error: { message: 'Insert failed' },
    });
    getUserStreak.mockResolvedValue({ success: true, streak: 0 });

    const result = await handleStampSubmit({
      username: 'testuser',
      pin: '1234',
    });

    expect(result).toEqual({ success: false, message: 'Error: Insert failed' });
  });
});
