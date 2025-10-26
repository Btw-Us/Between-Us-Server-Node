import type e = require("express");
const { getHeader } = require("../../middleware/headers.middleware");

const { AuthService } = require('./auth.service');



const longInOrRegisterUser = async (req: e.Request, res: e.Response) => {
    try {
        const { email, fullName, profilePictureUrl } = req.body;
        const allHeaders = await getHeader(req, res);
        if (!allHeaders) {
            return;
        }
        const { DeviceId: deviceId, DeviceModel: devicemodel } = allHeaders;
        if(!email){
            res.status(400).json({ error: 'Bad Request: Missing email in request body' });
        }
        if(!fullName){
            res.status(400).json({ error: 'Bad Request: Missing fullName in request body' });
        }

        const authService = new AuthService();
        const { user, isNewUser } = await authService.loginOrRegisterUser(
            email,
            fullName,
            deviceId,
            devicemodel,
            profilePictureUrl
        );
        const { uuid } = user;
        if (isNewUser) {
            res.status(201).json({ uuid, isNewUser: true });
        } else {
            res.status(200).json({ uuid, isNewUser: false });
        }
    } catch (error) {
        res.status(500).json({ error: `Internal error ${error}` });
    }
}


export = { longInOrRegisterUser };