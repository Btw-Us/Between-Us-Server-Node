const bcrypt = require('bcryptjs');

class HashingManager {
    private static readonly SALT_ROUNDS = 12;

    static async hashPassword(password: string): Promise<HashedPasswordResult> {
        const salt = await bcrypt.genSalt(HashingManager.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        return {
            hashedPassword,
            salt
        };
    }

    static async hashPasswordWithSalt(password: string, salt: string): Promise<string> {
        return await bcrypt.hash(password, salt);
    }

    static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async verifyPasswordWithSalt(
        plainPassword: string,
        salt: string,
        storedHashedPassword: string
    ): Promise<boolean> {
        const hashedInput = await bcrypt.hash(plainPassword, salt);
        return hashedInput === storedHashedPassword;
    }

    static async generateSalt(): Promise<string> {
        return await bcrypt.genSalt(HashingManager.SALT_ROUNDS);
    }
}

interface HashedPasswordResult {
    hashedPassword: string;
    salt: string;
}

module.exports = { HashingManager };