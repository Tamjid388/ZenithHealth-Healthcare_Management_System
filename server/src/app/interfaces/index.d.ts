import { Role } from "../../generated/prisma/enums";

export interface IReqUser {
  userId: string;
  role: Role;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
            user?: IReqUser;
    }
  }
}
