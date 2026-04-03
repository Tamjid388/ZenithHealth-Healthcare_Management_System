import dotenv from "dotenv";
dotenv.config();
const EnvVariables = () => {
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
            throw new Error(`Environment Variable ${key} is required but not set in .env`);
        }
    });
    return {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
        ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
        REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
        BETTER_AUTH_SESSION_EXPIRES_IN: process.env
            .BETTER_AUTH_SESSION_EXPIRES_IN,
        BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env
            .BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE,
        EMAIL_SENDER: {
            SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
            PASSWORD: process.env.EMAIL_SENDER_SMTP_PASSWORD,
            PORT: process.env.EMAIL_SENDER_SMTP_PORT,
            HOST: process.env.EMAIL_SENDER_SMTP_HOST,
            FROM: process.env.EMAIL_SENDER_SMTP_FROM,
        },
        CLOUDINARY: {
            CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
            API_KEY: process.env.CLOUDINARY_API_KEY,
            API_SECRET: process.env.CLOUDINARY_API_SECRET,
        },
    };
};
export const envVars = EnvVariables();
