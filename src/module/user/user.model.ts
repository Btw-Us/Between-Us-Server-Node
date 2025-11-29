
export interface CreateUserModel {
    uuid : string;
    username?: string;
    email : string;
    fullName? : string;
    created: Date;
    updated: Date;
    password: string;
}


export interface UserModel {
    uuid : string;
    username?: string;
    email : string;
    fullName? : string;
    created: Date;
    updated: Date;
    verified: boolean;
}