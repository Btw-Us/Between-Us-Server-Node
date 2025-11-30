import { AuthService, DeviceNotRegisteredError } from "./auth.service.js";
import { createErrorMessage } from "../../utils/response.js";
import { UserExistsError, InvalidCredentialsError, UserAlreadyVerifiedError } from "./auth.service.js";
import express from "express";
const authService = new AuthService();

export async function signUp(req: express.Request, res: express.Response) {
    const { email, password, passwordConfirm, username, fullname } = req.body;
    if (!email || !password || !passwordConfirm || !username || !fullname) {
        return res.status(400).json(createErrorMessage(
            'Bad Request',
            400,
            'Missing required fields: email, password, passwordConfirm, username, fullname'
        ));
    }
    // check password and passwordConfirm match
    if (password !== passwordConfirm) {
        return res.status(400).json(createErrorMessage(
            'Bad Request',
            400,
            'Password and passwordConfirm do not match.'
        ));
    }
    let result: { user: any; newUser: true; verified: boolean; } | null = null;
    try {
        const deviceId = req.headers['x-device-id'] as string;
        const deviceName = req.headers['x-device-name'] as string;
        result = await authService.signUp(email, password, passwordConfirm, username, fullname, deviceId, deviceName);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof UserExistsError) {
            return res.status(409).json(createErrorMessage(
                'Conflict',
                409,
                error.message
            ));
        }
        if (error instanceof DeviceNotRegisteredError) {
            return res.status(400).json(createErrorMessage(
                'Bad Request',
                400,
                error.message
            ));
        }
        res.status(500).json(createErrorMessage(
            'Server Error',
            500,
            `Authentication failed: ${(error as Error).message || error}`
        ));
    }
}

export async function signIn(req: express.Request, res: express.Response) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json(createErrorMessage(
            'Bad Request',
            400,
            'Missing required fields: email, password'
        ));
    }
    try {
        const result = await authService.signIn(email, password);
        // get device name and device id from headers
        const deviceId = req.headers['x-device-id'] as string;
        const deviceName = req.headers['x-device-name'] as string;
        console.log(`Registering device for user ${result.user.uid}: ${deviceId} - ${deviceName}`);
        await authService.registerDevice(result.user.uid, deviceId, deviceName);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            return res.status(401).json(createErrorMessage(
                'Unauthorized',
                401,
                error.message
            ));
        }

        res.status(500).json(createErrorMessage(
            'Server Error',
            500,
            `Authentication failed: ${(error as Error).message || error}`
        ));
    }
}


export async function sendVerificationEmail(req: express.Request, res: express.Response) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json(createErrorMessage(
            'Bad Request',
            400,
            'Missing required field: email'
        ));
    }
    try {
        const result = await authService.sendVerificationEmail(email);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof UserAlreadyVerifiedError) {
            return res.status(409).json(createErrorMessage(
                'Conflict',
                409,
                error.message
            ));
        }
        res.status(500).json(createErrorMessage(
            'Server Error',
            500,
            `Failed to send verification email: ${(error as Error).message || error}`
        ));
    }
}