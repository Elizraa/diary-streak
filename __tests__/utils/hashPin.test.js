import bcrypt from 'bcryptjs';
import { hashPin } from '../../src/utils/hashPin';

jest.mock('bcryptjs', () => ({
  genSaltSync: jest.fn(),
  hashSync: jest.fn(),
}));

describe('hashPin', () => {
  it('should return hashed pin', async () => {
    const HASHED_PIN = '1A2B';
    const SALT = 'SALT';
    const PIN = '1234';
    bcrypt.genSaltSync.mockReturnValue(SALT);
    bcrypt.hashSync.mockReturnValue(HASHED_PIN);

    const result = hashPin(PIN);

    expect(bcrypt.genSaltSync).toHaveBeenCalledWith(10);
    expect(bcrypt.hashSync).toHaveBeenCalledWith(PIN, SALT);
    expect(result).toBe(HASHED_PIN);
  });
});
