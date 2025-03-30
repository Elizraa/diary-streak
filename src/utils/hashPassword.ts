import bcrypt from 'bcryptjs';

export function hashPassword(pin: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pin, salt);
}
