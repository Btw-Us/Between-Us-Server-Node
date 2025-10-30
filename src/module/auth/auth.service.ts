const { UserModel } = require('../user/user.model');
const { generateUuidFromSub } = require('../../utils/generateUuid');
const { HashingManager } = require('../../cryptography/hashing/hashing');

class AuthService {


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
            createdAt: Date.now(),
            updatedAt: Date.now(),
            userDevices: {
                deviceId,
                deviceName,
                lastLoginAt: Date.now()
            }
        });
        await user.save();
        return await UserModel.findById(user._id)
            .select('-userPassword -userDevices')
            .lean();
    }


    async getUserByEmail(email: string) {
        return await UserModel
            .findOne({email: email})
            .exec();
    }

    async getUserById(userId: string) {
        return await UserModel
            .findOne({uuid: userId})
            .exec();
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
            lastLoginAt: Date.now()
        };
        user.updatedAt = Date.now();
        await user.save();
        return await UserModel.findById(user._id)
            .select('-userPassword -userDevices')
            .lean();
    }


    async isProfileComplete(userId: string): Promise<boolean> {
        const user = await UserModel
            .findOne({ uuid: userId })
            .exec();

        if (!user) {
            return false;
        }

        const { username, userPassword } = user;
        return !!(username && userPassword?.passwordHash);
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
    ): Promise<{ user: any; isProfileSetUpDone: boolean }> {
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
            const filterUser = await UserModel.findById(user._id)
                .select('-userPassword -userDevices')
                .lean();
            return { user:filterUser, isProfileSetUpDone: await this.isProfileComplete(user.uuid) };
        } else {
            // User does not exist, create new user
            user = await this.createUser(
                email,
                fullName,
                deviceId,
                deviceName,
                profilePictureUrl
            );
            const filterUser = await UserModel.findById(user._id)
                .select('-userPassword -userDevices')
                .lean();
            return { user:filterUser, isProfileSetUpDone: await this.isProfileComplete(user.uuid) };
        }
    }

    async completeUserProfile(
        userId: string,
        username: string,
        password: string
    ): Promise<{ user: any; isProfileSetUpDone: boolean }> {
        const user = await UserModel
            .findOne({ uuid: userId })
            .exec();
        if (!user) {
            throw new Error('User not found.');
        }
        user.username = username;
        // Here you would hash the password and store it securely
        user.updatedAt = Date.now();
        const salt:string = await  HashingManager.generateSalt();
        const hashedPassword: string = await HashingManager.hashPasswordWithSalt(password,salt);
        user.userPassword = {
            passwordHash:hashedPassword,
            salt:salt,
            lastPasswordChangeAt: Date.now()
        };
        await user.save();
        const filterUser = await UserModel.findById(user._id)
            .select('-userPassword -userDevices')
            .lean();
        return { user:filterUser, isProfileSetUpDone: true };
    }


    async logInWithEmailAndPassword(
        uuid: string,
        password: string,
    ){
        const user = await this.getUserById(uuid);
        if (!user) {
            throw new Error('User not found.');
        }
        if(!await this.isProfileComplete(uuid)){
            throw new Error('Profile setup is not complete.');
        }
        const isPasswordValid: boolean = await HashingManager.verifyPasswordWithSalt(
            password,
            user.userPassword.salt,
            user.userPassword.passwordHash
        );
        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }
        await user.save();
        const filterUser = await UserModel.findById(user._id)
            .select('-userPassword -userDevices')
            .lean();
        return { user:filterUser, isProfileSetUpDone: await this.isProfileComplete(user.uuid) };
    }
}
export = { AuthService };