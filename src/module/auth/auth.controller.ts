import type e = require("express");
const { getHeader } = require("../../middleware/headers.middleware");

const { AuthService } = require('./auth.service');


const longInOrRegisterUser = async (req: e.Request, res: e.Response) => {
    try {
        const { email, fullName, profilePictureUrl } = req.body;
        const deviceId = req.headers['x-device-id'];
        if (!deviceId) {
            res.status(400).json({ error: 'Bad Request: Missing X-Device-Id header' });
            return;
        }
        const deviceModel = req.headers['x-device-model'] || 'Unknown Device';
        if(!email){
            res.status(400).json({ error: 'Bad Request: Missing email in request body' });
        }
        if(!fullName){
            res.status(400).json({ error: 'Bad Request: Missing fullName in request body' });
        }

        const authService = new AuthService();
        const { user, isProfileSetUpDone } = await authService.loginOrRegisterUser(
            email,
            fullName,
            deviceId,
            deviceModel,
            profilePictureUrl
        );
        if (isProfileSetUpDone) {
            res.status(201).json({ user, isProfileSetUpDone: true });
        } else {
            res.status(200).json({ user, isProfileSetUpDone: false });
        }
    } catch (error) {
        res.status(500).json({ error: `Internal error ${error}` });
    }
}

const completeProfile = async (req: e.Request, res: e.Response) => {
    try {
        const allHeaders = await getHeader(req, res);
        if (!allHeaders) {
            return;
        }
        const {UserId} = allHeaders;
        const {uuid , userName,password } = req.body;
        if (UserId !== uuid) {
            res.status(403).json({ error: 'Forbidden: You can only complete your own profile' });
        }
        const authService = new AuthService();
        const updatedUser = await authService.completeUserProfile(
            UserId,
            userName,
            password
        );
        if (!updatedUser) {
            res.status(404).json({ error: 'Not Found: User does not exist' });
            return;
        }
        res.status(200).json(updatedUser);
    }catch (e) {
        res.status(500).json({ error: `Internal error ${e}` });
    }
}

const verifyPassword = async (req: e.Request, res: e.Response) => {
    try {
        const {  password } = req.body;
        const allHeaders = await getHeader(req, res);
        if (!allHeaders) {
            return;
        }
        const {UserId} = allHeaders;
        if(!password){
            res.status(400).json({ error: 'Bad Request: Missing password in request body' });
        }
        const authService = new AuthService();
        const { user, isProfileSetUpDone } = await authService.logInWithEmailAndPassword(
            UserId,
            password
        );
        if (!user) {
            res.status(401).json({ error: 'Unauthorized: Invalid email or password' });
            return;
        }
        res.status(200).json({ user, isProfileSetUpDone });
    } catch (error) {
        res.status(500).json({ error: `Internal error ${error}` });
    }
}

export = { longInOrRegisterUser , completeProfile,  verifyPassword};