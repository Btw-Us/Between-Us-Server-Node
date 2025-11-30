// import { CreateUserModel } from "../../module/user/user.model.js";
import { pb, authenticateAdminIfNeeded } from "../../lib/pocketbase.js";
import { generateUuidFromSub } from "../../utils/generateUuid.js";
import { CollectionName } from "../../utils/collectionName.js";

export class AuthService {
    /**
     * Sign in user with email and password
     */
    async signIn(email: string, password: string): Promise<{
        token: string;
        user: any;
        verified: boolean;
    }> {
        const existingUsers = await pb.collection(CollectionName.Users).getFullList({
            filter: `email="${email}"`,
            limit: 1
        });
        if (existingUsers.length === 0) {
            throw new InvalidCredentialsError('User with this email does not exist');
        }
        try {
            const authData = await pb.collection(CollectionName.Users).authWithPassword(email, password);
            return {
                token: authData.token,
                user: authData.record,
                verified: authData.record.verified
            };
        }
        catch (error) {
            throw new InvalidCredentialsError('Invalid email or password');
        }
    }

    /**
     * Sign up new user
     */
    async signUp(
        email: string,
        password: string,
        passwordConfirm: string,
        username: string,
        fullname: string,
        deviceId: string,
        deviceName: string
    ): Promise<{
        token: string;
        user: any;
        newUser: true;
        verified: boolean;
    }> {

        const existingUsers = await pb.collection(CollectionName.Users).getFullList({
            filter: `email="${email}"`,
            limit: 1
        });

        // // check if user have device details
        // const user : any = existingUsers[0];
        // if (!user.devicedetails || user.devicedetails.length === 0) {
        //     throw new DeviceNotRegisteredError('User must register device details before signing up');
        // }

        if (existingUsers.length > 0) {
            throw new UserExistsError('User with this email already exists');
        }
        const isUserNamedExist = await pb.collection(CollectionName.Users).getFullList({
            filter: `username="${username}"`,
            limit: 1
        });
        if (isUserNamedExist.length > 0) {
            throw new UserExistsError('User with this username already exists');
        }
        console.log('Creating new user...');
        const userData = {
            email,
            password,
            passwordConfirm,
            username,
            uid: generateUuidFromSub(email),
            fullname
        };

        await pb.collection(CollectionName.Users).create(userData);
        const authData = await pb.collection(CollectionName.Users).authWithPassword(email, password);
        // add device details to user
        try {
            await this.registerDevice(authData.record.uid, deviceId, deviceName);
        } catch (error) {
            console.error('❌ Device registration during signUp failed:', error);
            // Delete the created user to maintain data integrity
            await this.deleteUserOnError(authData.record.uid);
            throw new DeviceNotRegisteredError(`Device registration during signUp failed: ${(error as Error).message}`);
        }
        return {
            token: authData.token,
            user: authData.record,
            newUser: true,
            verified: authData.record.verified
        };
    }

    async sendVerificationEmail(email: string): Promise<{ IsSuccess: boolean }> {
        const existingUsers = await pb.collection(CollectionName.Users).getFirstListItem(`email="${email}"`);
        if (existingUsers.verified) {
            throw new UserAlreadyVerifiedError('User email is already verified');
        }
        try {
            await pb.collection(CollectionName.Users).requestVerification(email);
            return { IsSuccess: true };
        }
        catch (error) {
            throw new Error(`Failed to send verification email: ${(error as Error).message || error}`);
        }
    }

    async registerDevice(uid: string, deviceId: string, deviceName: string): Promise<void> {
        if (!uid || !deviceId || !deviceName) {
            throw new Error('Invalid parameters for device registration');
        }

        try {
            // 1. Find the user by uid
            const user = await pb.collection(CollectionName.Users).getFirstListItem(
                `uid="${uid}"`
            );
            const existingDeviceId = user.devicedetails
            if (!existingDeviceId || existingDeviceId.length === 0) {
                // 1. Create device record first
                const newDevice = await pb.collection(CollectionName.DeviceDetails).create({
                    uid, // This links it logically, even though relation is inverse
                    deviceId,
                    deviceName,
                    lastLoginAt: new Date().toISOString()
                });

                // 2. Update USER record to add the relation
                await pb.collection(CollectionName.Users).update(user.id, {
                    devicedetails: [newDevice.id] // Add device to relation field
                });

                console.log(`✅ New device registered for user ${uid}: ${deviceId}`);
                return;
            }
            // Update existing device record via relation
            await pb.collection(CollectionName.DeviceDetails).update((existingDeviceId as string), {
                deviceId,
                deviceName,
                lastLoginAt: new Date().toISOString()
            });
            console.log(`✅ Device updated for user ${uid}: ${deviceId}`);

        } catch (error) {
            console.error('❌ Device registration failed:', error);
            throw new Error(`Device registration failed: ${(error as Error).message}`);
        }
    }

    async checkDeviceDetails(uid: string, deviceId: string): Promise<boolean> {
        const deviceRecord = await pb.collection(CollectionName.DeviceDetails).getFirstListItem(`uid="${uid}" && deviceId="${deviceId}"`).catch(() => null);
        return deviceRecord !== null;
    }

    async deleteUserOnError(uid: string): Promise<void> {
        try {
            const adminAuthenticated = await authenticateAdminIfNeeded();
            if (!adminAuthenticated) {
                console.error('❌ Admin authentication required to delete user.');
                return;
            }
            const user = await pb.collection(CollectionName.Users).getFirstListItem(`uid="${uid}"`);
            await pb.collection(CollectionName.Users).delete(user.id);
            console.log(`✅ Deleted user with uid ${uid} due to error during registration.`);
        } catch (error) {
            console.error(`❌ Failed to delete user with uid ${uid}:`, error);
        }
    }
}

export class UserExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UserExistsError";
    }
}

export class InvalidCredentialsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidCredentialsError";
    }
}

export class UserAlreadyVerifiedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UserAlreadyVerifiedError";
    }
}

export class DeviceNotRegisteredError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DeviceNotRegisteredError";
    }
}