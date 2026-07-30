export interface TLoginTypes{
  token: string;
  refreshToken: string;
  accessToken: string;
  user: {
   needChangePassword: boolean;
    name: string;
    email: string;
    role: string;
    image: string;
    status: string;
    isDeleted: boolean;
    emailVerified: boolean;

  };
}