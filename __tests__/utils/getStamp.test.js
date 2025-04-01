import { getUserStamps } from '../../src/utils/getStamp';
import { createClient } from '../../src/utils/supabase/client';

jest.mock('../../src/utils/supabase/client');

describe('getUserStamps', () => {
  let supabaseMock;
  const username = 'Zeta';
  const stampsData = [
    { notes: 'example notes', created_at: '2025-04-01T17:09:14.692Z' },
  ];

  beforeEach(() => {
    supabaseMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn(),
    };
    createClient.mockReturnValue(supabaseMock);
  });

  it('should return error if user not found', async () => {
    const errorMessage = 'User not found';
    supabaseMock.order.mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    });

    const result = await getUserStamps({
      username,
    });

    expect(result).toEqual({
      success: false,
      message: errorMessage,
      stamps: [],
    });
  });

  it('should return success and stamps data if data found', async () => {
    supabaseMock.order.mockResolvedValue({
      data: stampsData,
    });

    const result = await getUserStamps({
      username: 'testuser',
      pin: '1234',
      notes: 'Test note',
    });

    expect(result).toEqual({
      success: true,
      message: 'Fetch Data Successfull!',
      stamps: stampsData,
    });
  });
});
