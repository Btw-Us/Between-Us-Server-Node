const { serverDatabaseConnection } = require('../config/serverDatabase');
const { ServerTokenModel } = require('../module/server/server.model');
const { UserModel } = require('../module/user/user.model');


class ServerCheckService {
    private dbConnection;
    constructor() {
        this.dbConnection = serverDatabaseConnection;
    }
    async isConnected() {
        return this.dbConnection.readyState === 1; // 1 means connected
    }
    
    async validateServerToken(token: string) : Promise<boolean>{
        const tokenRecord = await ServerTokenModel.findOne({
            Token: token,
        });
        return tokenRecord !== null;
    }

    async validateUserDevice(userId: string, deviceId: string) : Promise<boolean> {
        return UserModel.findOne({
            uuid: userId,
            'userDevices.deviceId': deviceId
        }).exec()
        .then((user: any) => user !== null)
        .catch(() => false);
    }
}

export = { ServerCheckService };