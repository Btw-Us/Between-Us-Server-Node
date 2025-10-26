const { betweenUsDatabaseConnection } = require('../../config/database');
const { ServerTokenModel } = require('./server.model');
const { generateUuid } = require('../../utils/generateUuid');


class ServerService {
    private dbConnection;
    constructor() {
        this.dbConnection = betweenUsDatabaseConnection;
    }

    async isConnected() {
        return this.dbConnection.readyState === 1; // 1 means connected
    }

    async createServerTokken(generatedFrom: string, createByUserId?: string, expriesAt?: Date) {
        const token = generateUuid();
        const serverToken = new ServerTokenModel({
            GeneratedFrom: generatedFrom,
            Token: token,
            CreateByUserId: createByUserId,
            ExpriesAt: expriesAt,
            CreatedAt: new Date()
        });
        await serverToken.save();
        return serverToken;
    }

    async getAllServerTokkens() {
        return await ServerTokenModel.find();
    }
}

export = { ServerService };