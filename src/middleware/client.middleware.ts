import express from 'express';
import { createErrorMessage } from '../utils/response.js';
import 'dotenv/config';
import { ServerService } from '../module/server/server.service.js';
import { ClientType } from '../module/server/server.model.js';
import { AuthService } from '../module/auth/auth.service.js';

export async function clientMiddlewareBasic(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        var authorization = req.headers['authorization'];
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json(createErrorMessage(
                'Unauthorized',
                401,
                'Missing or invalid Authorization header.'
            ));
        }
        const token = authorization.substring(7); // Remove 'Bearer ' prefix
        // Here you can add your logic to validate the token
        // For demonstration, let's assume any non-empty token is valid
        if (!token || token.trim() === '') {
            return res.status(401).json(createErrorMessage(
                'Unauthorized',
                401,
                'Invalid token.'
            ));
        }
        // all good, proceed to for token
        var serverService = new ServerService();
        const isValid = await serverService.checkIsValidServerToken(token);
        
        if (!isValid) {
            return res.status(401).json(createErrorMessage(
                'Unauthorized',
                401,
                'Token is not valid.'
            ));
        }
        // then get the next x-client-type
        const clientType = req.headers['x-client-type'] as string;
        if (!clientType || !Object.values(ClientType).includes(clientType as ClientType)) {
            return res.status(400).json(createErrorMessage(
                'Bad Request',
                400,
                'Missing or invalid x-client-type header.'
            ));
        }
        // all good, proceed to next middleware
        next();
        
    } catch (error) {
        res.status(500).json(createErrorMessage(
            'Server Error',
            500,
            `An unexpected error occurred: ${(error as Error).message || error}`
        ));
    }
}


export async function clientMiddlewareAllHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const deviceId = req.headers['x-device-id'] as string;
        const deviceName = req.headers['x-device-name'] as string;
        if (!deviceId || !deviceName) {
            return res.status(400).json(createErrorMessage(
                'Bad Request',
                400,
                'Missing required headers: x-device-id, x-device-name.'
            ));
        }

        clientMiddlewareBasic(req, res, next);
    } catch (error) {
        res.status(500).json(createErrorMessage(
            'Server Error',
            500,
            `An unexpected error occurred: ${(error as Error).message || error}`
        ));
    }
}

export async function clientDeviceRegistrationMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(400).json(createErrorMessage(
                'Bad Request',
                400,
                'Missing required header: x-user-id.'
            ));
        }
        const deviceId = req.headers['x-device-id'] as string;
        const deviceName = req.headers['x-device-name'] as string;
        if (!deviceId || !deviceName) {
            return res.status(400).json(createErrorMessage(
                'Bad Request',
                400,
                'Missing required headers: x-device-id, x-device-name.'
            ));
        }
        const server = new AuthService();
        const isDeviceValid = await server.checkDeviceDetails(userId, deviceId);
        if (!isDeviceValid) {
            return res.status(401).json(createErrorMessage(
                'Unauthorized',
                401,
                'Device is not registered.'
            ));
        }   
        clientMiddlewareBasic(req, res, next);
    } catch (error) {
        res.status(500).json(createErrorMessage(
            'Server Error',
            500,
            `An unexpected error occurred: ${(error as Error).message || error}`
        ));
    }
}