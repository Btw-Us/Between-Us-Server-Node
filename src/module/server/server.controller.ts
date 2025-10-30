import type e = require("express");

const { ServerService } = require('./server.service');
const { createErrorMessage } = require('../../utils/errorResponse');

const createServerToken = async (req: e.Request, res: e.Response) => {
    try {
        const { generatedFrom, createByUserId, expriesAt } = req.body || {};

        if (!generatedFrom) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'generatedFrom is required'
                )
            )
            return;
        }

        const serverService = new ServerService();
        const serverToken = await serverService.createServerTokken(generatedFrom, createByUserId, expriesAt);
        res.status(201).json(serverToken);
    } catch (error) {
        res.status(500).json(
            createErrorMessage(
                'Internal Server Error',
                500,
                `An error occurred while creating server token: ${error}`
            )
        );
    }
}

const getAllServerTokens = async (req: e.Request, res: e.Response) => {
    try {
        const serverService = new ServerService();
        const tokens = await serverService.getAllServerTokkens();
        res.status(200).json(tokens);
    } catch (error) {
        res.status(500).json(
            createErrorMessage(
                'Internal Server Error',
                500,
                `An error occurred while fetching server tokens: ${error}`
            )
        );
    }
}

module.exports = { createServerToken , getAllServerTokens };