import { Role } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: number;
        role: Role;
      };
    }
  }
}
