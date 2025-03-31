import bcrypt from 'bcryptjs';

export function hashPin(pin: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pin, salt);
}
