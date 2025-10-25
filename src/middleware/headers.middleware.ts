import type e = require("express");

const { ServerCheckService } = require('../service/serverCheck.service');

async function checkAdminHeader(req: e.Request, res: e.Response, next: e.NextFunction) {
    try {
        const apiKey = req.headers['authorization'];
        const serverCheckService = new ServerCheckService();
        const isValid = await serverCheckService.validateServerToken(apiKey as string);
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


async function validateServerTokenGeneration(req: e.Request, res: e.Response, next: e.NextFunction) {
    try {
        const apiKey = req.headers['authorization'];
        if (apiKey !== process.env.SERVER_ADMIN_PASSWORD){
            res.status(401).json({ error: 'Unauthorized: Invalid or missing server admin password' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: `Internal error ${error}` });
    }
}

export = { checkAdminHeader, validateServerTokenGeneration };