const { serverDatabaseConnection } = require('../config/serverDatabase');
const { ServerTokenModel } = require('../module/server/server.model');


class ServerCheckService {
    private dbConnection;
    constructor() {
        this.dbConnection = serverDatabaseConnection;
    }
    async isConnected() {
        return this.dbConnection.readyState === 1; // 1 means connected
    }
    
    async validateServerToken(token: string) {
        const tokenRecord = await ServerTokenModel.findOne({
            Token: token,
        });
        return tokenRecord !== null;
    }
}

export = { ServerCheckService };