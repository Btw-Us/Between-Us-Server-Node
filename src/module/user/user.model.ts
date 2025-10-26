const mangoose = require('mongoose');


enum UserStatusType{
    Online = "Online",
    Offline = "Offline"
}


const userStatusSchema = new mangoose.Schema({
    status: {
        type: String,
        enum: Object.values(UserStatusType),
        required: true,
        default: UserStatusType.Offline
    },
    changedAt: {
        type: Date,
        default: Date.now
    }
});


const userPassowrdSchema = new mangoose.Schema({
    passwordHash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    lastPasswordChangeAt: {
        type: Date,
        default: Date.now
    }
})


const UserDeviceSchema = new mangoose.Schema({
    deviceId : {
        type: String,
        required: true
    },
    deviceName : {
        type: String,
        required: true
    },
    lastLoginAt : {
        type: Date,
        default: Date.now
    }
});


const userSchema = new mangoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        nullable: false
    },
    profilePictureUrl: {
        type: String,
        required: false,
        nullable: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    userStatus: userStatusSchema,
    userPassword: userPassowrdSchema,
    userDevices: UserDeviceSchema
});

const UserModel = mangoose.model('User', userSchema);

export = {UserModel, UserStatusType};