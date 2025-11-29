// import { CreateUserModel } from "../../module/user/user.model.js";
import { pb } from "../../lib/pocketbase.js";
import { generateUuidFromSub } from "../../utils/generateUuid.js";
import { CollectionName } from "../../utils/collectionName.js";

export class AuthService {
    /**
     * Sign in user with email and password
     */
    async signIn(email: string, password: string): Promise<{
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
        fullname: string
    ): Promise<{
        user: any;
        newUser: true;
        verified: boolean;
    }> {

        const existingUsers = await pb.collection(CollectionName.Users).getFullList({
            filter: `email="${email}"`,
            limit: 1
        });
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

        return {
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