import { registerUser } from '../../src/utils/registerUser';
import { hashPassword } from '../../src/utils/hashPassword';
import { createClient } from '../../src/utils/supabase/client';

jest.mock('../../src/utils/supabase/client');
jest.mock('../../src/utils/hashPassword');

describe('registerUser', () => {
  let mockInsert;

  beforeEach(() => {
    mockInsert = jest.fn();
    createClient.mockReturnValue({
      from: jest.fn().mockReturnValue({ insert: mockInsert }),
    });
  });

  it('should register a user successfully', async () => {
    hashPassword.mockReturnValue('hashed_pin');
    mockInsert.mockResolvedValue({ error: null });

    const result = await registerUser('testuser', '1234');

    expect(hashPassword).toHaveBeenCalledWith('1234');
    expect(mockInsert).toHaveBeenCalledWith([
      { username: 'testuser', pin: 'hashed_pin' },
    ]);
    expect(result).toBe('User registered!');
  });

  it('should return an error message if registration fails', async () => {
    hashPassword.mockReturnValue('hashed_pin');
    mockInsert.mockResolvedValue({ error: { message: 'Database error' } });

    const result = await registerUser('testuser', '1234');

    expect(result).toBe('Error: Database error');
  });
});
