// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from '../../entity/User';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: number;
        email: string;
        role?: string;
        wallet_address?: string;
      };
    }
  }
}
