import express from 'express';
import { createErrorMessage } from '../utils/response.js';
import 'dotenv/config';
import { ClientType } from '../module/server/server.model.js';

export async function serverMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        const serverJwtSecret = process.env.SERVER_JWT_SECRET ?? res.status(500).json(createErrorMessage(
            'Configuration Error',
            500,
            'SERVER_JWT_SECRET is not set in environment variables.'
        ));
        // check for server JWT is empty or null 
        if (!serverJwtSecret || serverJwtSecret.toString().trim() === '') {
            return res.status(500).json(createErrorMessage(
                'Configuration Error',
                500,
                'SERVER_JWT_SECRET is not set in environment variables.'
            ));
        }
        // get authorization header x-server-jwt
        const serverJwt = req.headers['x-server-jwt'] as string;
        if (!serverJwt) {
            return res.status(401).json(createErrorMessage(
                'Unauthorized',
                401,
                'Missing x-server-jwt header.'
            ));
        }
        // compare the serverJwt with serverJwtSecret
        if (serverJwt !== serverJwtSecret) {
            return res.status(401).json(createErrorMessage(
                'Unauthorized',
                401,
                'Invalid x-server-jwt token.'
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
    }
    catch (error) {
        res.status(500).json(createErrorMessage(
            'Server Error',
            500,
            `An unexpected error occurred: ${(error as Error).message || error}`
        ));
    }
}