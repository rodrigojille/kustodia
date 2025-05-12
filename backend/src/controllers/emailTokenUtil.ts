import crypto from 'crypto';

export function generateToken(length = 48) {
  return crypto.randomBytes(length).toString('hex');
}
