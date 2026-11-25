import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';

// Decode the JWT token without secret key verification.
export const decodeJwt = <T = unknown>(token: string): T | null => {
  const result = jwt.decode(token, { complete: true }) as Jwt | null;
  if (!result || typeof result.payload !== 'object' || result.payload === null) {
    throw new Error('decodeJwt: Invalid token.');
  }
  const payload = result.payload as JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  if ((payload.exp !== undefined && payload.exp < now) || (payload.iat !== undefined && payload.iat > now)) {
    throw new Error('decodeJwt: The token is expired.');
  }
  return typeof payload.data === 'string' ? JSON.parse(payload.data) : (payload.data ?? null);
};
