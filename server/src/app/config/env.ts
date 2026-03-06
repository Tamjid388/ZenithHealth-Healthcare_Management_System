import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
  EMAIL_SENDER: {
    SMTP_USER: string;
    PASSWORD: string;
    PORT: string;
    HOST: string;
    FROM: string;
  };
  CLOUDINARY: {
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
  }
}
const EnvVariables = (): EnvConfig => {
  const requireEnv = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASSWORD",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_FROM",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  requireEnv.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(
        `Environment Variable ${key} is required but not set in .env`,
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    BETTER_AUTH_SESSION_EXPIRES_IN: process.env
      .BETTER_AUTH_SESSION_EXPIRES_IN as string,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env
      .BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
      PASSWORD: process.env.EMAIL_SENDER_SMTP_PASSWORD as string,
      PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
      HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
      FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
    },
    CLOUDINARY: {
      CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      API_KEY: process.env.CLOUDINARY_API_KEY as string,
      API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
  };
};

export const envVars = EnvVariables();
