import { getUserStamps } from '../../src/utils/getStamp';
import { createClient } from '../../src/utils/supabase/client';

jest.mock('../../src/utils/supabase/client');

let supabaseMock;

beforeEach(() => {
  supabaseMock = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn(),
  };
  createClient.mockReturnValue(supabaseMock);
});

describe('getUserStamps', () => {
  const username = 'testuser';

  it('should return transformed stamps for authorized user', async () => {
    const mockData = [
      {
        created_at: '2024-01-01T00:00:00Z',
        mood: 'happy',
        notes: 'Good day!',
        users: { username },
      },
    ];

    supabaseMock.order.mockResolvedValue({ data: mockData, error: null });

    const result = await getUserStamps(username, true);

    expect(result.success).toBe(true);
    expect(result.data.stamps[0]).toEqual({
      date: new Date('2024-01-01T00:00:00Z'),
      mood: 'happy',
      note: 'Good day!',
    });
    expect(supabaseMock.select).toHaveBeenCalledWith(
      'notes, created_at, users!inner(username), mood'
    );
  });

  it('should return minimal fields for unauthorized user', async () => {
    const mockData = [
      {
        created_at: '2024-01-01T00:00:00Z',
        users: { username },
      },
    ];

    supabaseMock.order.mockResolvedValue({ data: mockData, error: null });

    const result = await getUserStamps(username, false);

    expect(result.success).toBe(true);
    expect(result.data.stamps[0]).toEqual({
      date: new Date('2024-01-01T00:00:00Z'),
      mood: undefined,
      note: undefined,
    });
    expect(supabaseMock.select).toHaveBeenCalledWith(
      'created_at, users!inner(username)'
    );
  });

  it('should throw an error if Supabase returns error', async () => {
    supabaseMock.order.mockResolvedValue({
      data: null,
      error: { message: 'Something went wrong' },
    });

    await expect(getUserStamps(username, true)).rejects.toThrow(
      'Something went wrong'
    );
  });
});
