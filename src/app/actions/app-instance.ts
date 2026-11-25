import { decodeJwt } from '@/app/utils/jwt-verify';

export interface ParsedAccessToken {
  instance?: {
    instanceId?: string;
  };
}

export const parseAccessToken = (token: string) => {
  return decodeJwt<ParsedAccessToken>(token.replace(/.*JWS\./, ''));
};
