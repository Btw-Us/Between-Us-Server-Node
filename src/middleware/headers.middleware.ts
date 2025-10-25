import type e = require("express");

const { ServerService } = require('../module/server/server.service');

async function checkAdminHeader(req: e.Request, res: e.Response, next: e.NextFunction) {
    try {
        const apiKey = req.headers['authorization'];
        const serverService = new ServerService();
        const isValid = await serverService.validateServerToken(apiKey as string);
        const baseURL = req.protocol + '://' + req.get('host');
        if (!isValid) {
            res.status(401)
                .json({ error: `Unauthorized: Invalid or missing admin token.To generate one use ${baseURL}/api/v1/server/tokken/generate` });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: `Internal error ${error}` });
    }
}

export = { checkAdminHeader };