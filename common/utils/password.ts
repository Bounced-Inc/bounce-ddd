import crypto from 'crypto';

export const hashPassword = (password: string): string => {
    return crypto
        .createHash('md5')
        .update(password)
        .digest('hex');
};
