const { serverDatabaseConnection } = require('../../config/serverDatabase');
const { ServerTokenModel } = require('./server.model');
const { generateUuid } = require('../../utils/generateUuid');


class ServerService {
    private dbConnection;
    constructor() {
        this.dbConnection = serverDatabaseConnection;
    }

    async isConnected() {
        return this.dbConnection.readyState === 1; // 1 means connected
    }

    async createServerTokken(generatedFrom: string, createByUserId?: string, expriesAt?: Date) {
        const tokken = generateUuid();
        const serverToken = new ServerTokenModel({
            GeneratedFrom: generatedFrom,
            Token: tokken,
            CreateByUserId: createByUserId,
            ExpriesAt: expriesAt,
            CreatedAt: new Date()
        });
        await serverToken.save();
        return serverToken;
    }
}

export = { ServerService };