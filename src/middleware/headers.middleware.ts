import type e = require("express");

const { ServerCheckService } = require('../service/serverCheck.service');
const { createErrorMessage} = require('../utils/errorResponse');

enum ClientType {
    WEB = 'WEB',
    MOBILE = 'MOBILE',
    DESKTOP = 'DESKTOP',
    API = 'API',
    OTHER = 'OTHER'
}

async function checkAdminHeader(req: e.Request, res: e.Response, next: e.NextFunction) {
    try {
        const clientType = req.headers['x-client-type'];
        // check client type is present of not if not then set it to OTHER
        if (!clientType || clientType === ClientType.OTHER) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing or invalid X-Client-Type header'
                )
            )
            return;
        }
        const apiKey = req.headers['authorization'];
        const serverCheckService = new ServerCheckService();
        const isValid = await serverCheckService.validateServerToken(apiKey as string);
        const baseURL = req.protocol + '://' + req.get('host');
        if (!isValid) {
            res.status(401)
                .json(
                    createErrorMessage(
                        'Unauthorized',
                        401,
                        `Invalid or missing admin token. To generate one use ${baseURL}/api/v1/server/tokken/generate`
                    )
                )
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json(
            createErrorMessage(
                'Internal Server Error',
                500,
                `An error occurred while validating admin header: ${error}`
            )
        );
    }
}


async function validateServerTokenGeneration(req: e.Request, res: e.Response, next: e.NextFunction) {
    try {
        const clientType = req.headers['x-client-type'];
        // check client type is present of not if not then set it to OTHER
        if (!clientType || clientType === ClientType.OTHER) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing or invalid X-Client-Type header'
                )
            )

            return;
        }
        const apiKey = req.headers['authorization'];
        if (apiKey !== process.env.SERVER_ADMIN_PASSWORD) {
            res.status(401).json(
                createErrorMessage(
                    'Unauthorized',
                    401,
                    'Invalid or missing server admin password'
                )
            )
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: `Internal error ${error}` });
    }
}

/** 
 * Extracts and validates custom headers from the request.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @returns An object containing the extracted header values or sends an error response.
 * objects values.
 * {
 *   APIKey: string,
 *  ClientType: string,
 *  UserId: string,
 *  DeviceId: string,
 * DeviceModel: string,
 * ClientVersion: string
 * }
*/
async function getHeader(
    req: e.Request,
    res: e.Response,
) {
    try {
        const apiKey = req.headers['authorization'];
        if (!apiKey) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing authorization header'
                )
            )
            return;
        }
        const clientType = req.headers['x-client-type'];
        if (!clientType) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing X-Client-Type header'
                )
            )
            return;
        }
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing X-User-Id header'
                )
            )
            return;
        }
        const deviceId = req.headers['x-device-id'];
        if (!deviceId) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing X-Device-Id header'
                )
            )
            return;
        }
        const rowDeviceModel = req.headers['x-device-model'];
        const deviceModel = Array.isArray(rowDeviceModel) ? rowDeviceModel[0] : (rowDeviceModel ?? 'Unknown Device');

        const rawClientVersion = req.headers['x-client-version'];
        const clientVersion = Array.isArray(rawClientVersion) ? rawClientVersion[0] : (rawClientVersion ?? '0.0.1');
        return {
            APIKey: apiKey as string,
            ClientType: clientType as string,
            UserId: userId as string,
            DeviceId: deviceId as string,
            DeviceModel: deviceModel as string,
            ClientVersion: clientVersion as string
        }
    } catch (error) {
        return null;
    }
}


async function checkDeviceIntegrity(
    req: e.Request,
    res: e.Response,
    next: e.NextFunction
) {
    try {
        const headers = await getHeader(req, res);
        if (!headers) {
            return;
        }
        const serverCheckService = new ServerCheckService();
        const isValid = await serverCheckService.validateUserDevice(
            headers.UserId,
            headers.DeviceId,
        );
        if (!isValid) {
            res.status(401).json(
                createErrorMessage(
                    'Unauthorized',
                    401,
                    'Device not registered for user'
                )
            )
            return;
        }
        next();

    } catch (error) {
        res.status(500).json(
            createErrorMessage(
                'Internal Server Error',
                500,
                `An error occurred while checking device integrity: ${error}`
            )
        )
    }
}

export = { checkAdminHeader, validateServerTokenGeneration, getHeader, checkDeviceIntegrity };