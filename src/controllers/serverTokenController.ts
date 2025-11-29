import type { Request, Response } from 'express';
import { ServerService } from '../services/serverTokenService.js';
import { createErrorMessage } from '../utils/response.js';

export const createTokenHandler = async (req: Request, res: Response) => {
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

export const getTokenHandler = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const serverService = new ServerService();
        const record = await serverService.getServerToken(token || '');
        if (!record) {
            res.status(404).json({ error: 'Token not found' });
            return;
        }
        res.json(record);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
