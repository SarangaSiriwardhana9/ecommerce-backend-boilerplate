import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-characters-long',
    expiresIn: process.env.JWT_EXPIRY || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
}));
