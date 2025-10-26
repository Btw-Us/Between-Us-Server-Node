const { betweenUsDatabaseConnection } = require('../../config/database');
const { UserModel } = require('../user/user.model');
const { generateUuidFromSub } = require('../../utils/generateUuid');

class AuthService {
    private dbConnection;
    constructor() {
        this.dbConnection = betweenUsDatabaseConnection;
    }

    async isConnected() {
        return this.dbConnection.readyState === 1; // 1 means connected
    }

    async createUser(
        email: string,
        fullName: string,
        deviceId: string,
        deviceName: string,
        profilePictureUrl?: string,
    ) {
        const uuid = generateUuidFromSub(email);
        const user = new UserModel({
            uuid: uuid,
            email: email,
            fullName: fullName,
            profilePictureUrl: profilePictureUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
            userDevices: {
                deviceId,
                deviceName,
                lastLoginAt: new Date()
            }
        });
        await user.save();
        return user;
    }


    async getUserByEmail(email: string) {
        const user = await UserModel
            .findOne({ email: email })
            .exec();
        return user;
    }

    async updateUserDevice(
        userId: string,
        deviceId: string,
        deviceName: string
    ) {
        const user = await UserModel
            .findOne({ uuid: userId })
            .exec();
        if (!user) {
            return null;
        }
        user.userDevices = {
            deviceId,
            deviceName,
            lastLoginAt: new Date()
        };
        user.updatedAt = new Date();
        await user.save();
        return user;
    }


    async isProfileComplete(userId: string): Promise<boolean> {
        const user = await UserModel
            .findOne({ uuid: userId })
            .exec();
        if (!user) {
            return false;
        }
        return user.username !== null && user.username !== '';
    }


    async checkUserExistsByEmail(email: string) {
        const user = await UserModel
            .findOne({ email: email })
            .exec();
        return user !== null;
    }

    /**
     * Logs in an existing user or registers a new user if they do not exist.
     * @param email - The email of the user.
     * @param fullName - The full name of the user.
     * @param deviceId - The ID of the device the user is logging in from.
     * @param deviceName - The name of the device the user is logging in from.
     * @param profilePictureUrl - (Optional) The URL of the user's profile picture.
     * @returns The logged-in or newly registered user.
     */
    async loginOrRegisterUser(
        email: string,
        fullName: string,
        deviceId: string,
        deviceName: string,
        profilePictureUrl?: string,
    ) {
        let user = await this.getUserByEmail(email);
        if (user) {
            // User exists, update device info
            user = await this.updateUserDevice(
                user.uuid,
                deviceId,
                deviceName
            );
            if (!user) {
                throw new Error('Failed to update user device information.');
            }
            return { user, isNewUser: false };
        } else {
            // User does not exist, create new user
            user = await this.createUser(
                email,
                fullName,
                deviceId,
                deviceName,
                profilePictureUrl
            );
            return { user, isNewUser: true };
        }
    }
}
export = { AuthService };