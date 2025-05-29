import { verifyUser } from '../../src/utils/verifyUser';
import { createClient } from '../../src/utils/supabase/client';
import bcrypt from 'bcryptjs';

jest.mock('../../src/utils/supabase/client').mock('bcryptjs', () => ({
  compareSync: jest.fn(),
}));

let supabaseMock;

beforeEach(() => {
  supabaseMock = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  createClient.mockReturnValue(supabaseMock);
});

describe('#verifyUser', () => {
  const userFormData = {
    username: 'testuser',
    pin: 'hashed_pin',
  };

  it('should return user data if verification is successful', async () => {
    const mockUserData = { id: 1, pin: 'hashed_pin' };
    supabaseMock.single.mockResolvedValue({
      data: mockUserData,
    });
    bcrypt.compareSync = jest.fn().mockReturnValue(true);

    const result = await verifyUser(userFormData);

    expect(result).toEqual(mockUserData);
    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      userFormData.pin,
      mockUserData.pin
    );
  });

  it('should throw an error if pin is incorrect', async () => {
    supabaseMock.single.mockResolvedValue({
      data: { id: 1, pin: 'hashed_pin' },
    });
    bcrypt.compareSync = jest.fn().mockReturnValue(false);

    await expect(verifyUser(userFormData)).rejects.toThrow(
      'Invalid username or PIN'
    );

    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      userFormData.pin,
      'hashed_pin'
    );
  });
});
