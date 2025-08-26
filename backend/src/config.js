import 'dotenv/config';

export const CONFIG = {
    PORT: process.env.PORT ?? 4000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    NODE_ENV: process.env.NODE_ENV ?? 'development'
};