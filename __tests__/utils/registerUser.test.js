import { registerUser } from '../../src/utils/registerUser';
import { hashPin } from '../../src/utils/hashPin';
import { createClient } from '../../src/utils/supabase/client';

jest.mock('../../src/utils/supabase/client');
jest.mock('../../src/utils/hashPin');

describe('registerUser', () => {
  let mockInsert;

  beforeEach(() => {
    mockInsert = jest.fn();
    createClient.mockReturnValue({
      from: jest.fn().mockReturnValue({ insert: mockInsert }),
    });
  });

  it('should register a user successfully', async () => {
    hashPin.mockReturnValue('hashed_pin');
    mockInsert.mockResolvedValue({ error: null });

    const result = await registerUser('testuser', '1234');

    expect(hashPin).toHaveBeenCalledWith('1234');
    expect(mockInsert).toHaveBeenCalledWith([
      { username: 'testuser', pin: 'hashed_pin' },
    ]);
    expect(result).toBe('User registered!');
  });

  it('should return an error message if registration fails', async () => {
    hashPin.mockReturnValue('hashed_pin');
    mockInsert.mockResolvedValue({ error: { message: 'Database error' } });

    const result = await registerUser('testuser', '1234');

    expect(result).toBe('Error: Database error');
  });
});
