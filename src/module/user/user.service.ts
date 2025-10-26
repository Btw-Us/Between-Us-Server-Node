const { betweenUsDatabaseConnection } = require('../../config/database');
const { UserModel } = require('./user.model');
const { generateUuidFromSub } = require('../../utils/generateUuid');

class UserService {
    private dbConnection;
    constructor() {
        this.dbConnection = betweenUsDatabaseConnection;
    }

    async isConnected() {
        return this.dbConnection.readyState === 1; // 1 means connected
    }

    async createUser(
        username: string,
        email: string,
        fullName: string,
        deviceId: string,
        deviceName: string,
        profilePictureUrl?: string,
    ) {
        const uuid = generateUuidFromSub(email);
        const user = new UserModel({
            uuid,
            username,
            email,
            fullName,
            profilePictureUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
            userDevices: [{
                deviceId,
                deviceName,
                lastLoginAt: new Date()
            }]
        });
        await user.save();
        return user;
    }


    async checkUserExistsByEmail(email: string) {
        const user = await UserModel
            .findOne({ email: email })
            .exec();
        return user !== null;
    }
    async getAndUpdateUserLastLoginDevice(userId: string, deviceId: string, deviceName: string) {
        const user = await UserModel.findOne({ uuid: userId }).exec();
        if (!user) {
            throw new Error('User not found');
        }
        user.userDevices.push({
            deviceId,
            deviceName,
            lastLoginAt: new Date()
        });
        user.updatedAt = new Date();
        await user.save();
        return user;
    }
}