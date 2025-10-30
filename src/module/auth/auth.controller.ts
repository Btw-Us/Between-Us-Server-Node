import type e = require("express");

const {getHeader} = require("../../middleware/headers.middleware");
const {createErrorMessage} = require('../../utils/errorResponse');

const {AuthService} = require('./auth.service');


const longInOrRegisterUser = async (req: e.Request, res: e.Response) => {
    try {
        const {email, fullName, profilePictureUrl} = req.body;
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
        const deviceModel = req.headers['x-device-model'] || 'Unknown Device';
        if (!email) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing email in request body'
                )
            )
        }
        if (!fullName) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing fullName in request body'
                )
            )
        }

        const authService = new AuthService();
        const {user, isProfileSetUpDone} = await authService.loginOrRegisterUser(
            email,
            fullName,
            deviceId,
            deviceModel,
            profilePictureUrl
        );
        if (isProfileSetUpDone) {
            res.status(201).json({user, isProfileSetUpDone: true});
        } else {
            res.status(200).json({user, isProfileSetUpDone: false});
        }
    } catch (error) {
        res.status(500).json({error: `Internal error ${error}`});
        res.status(500).json(
            createErrorMessage(
                'Internal Server Error',
                500,
                `An error occurred during login or registration: ${error}`
            )
        )
    }
}

const completeProfile = async (req: e.Request, res: e.Response) => {
    try {
        const allHeaders = await getHeader(req, res);
        if (!allHeaders) {
            return;
        }
        const {UserId} = allHeaders;
        const {uuid, userName, password} = req.body;
        if (UserId !== uuid) {
            res.status(403).json(
                createErrorMessage(
                    'Forbidden',
                    403,
                    'You can only complete your own profile'
                )
            )
        }
        const authService = new AuthService();
        const updatedUser = await authService.completeUserProfile(
            UserId,
            userName,
            password
        );
        if (!updatedUser) {
            res.status(404).json(
                createErrorMessage(
                    'Not Found',
                    404,
                    'User does not exist'
                )
            )
            return;
        }
        res.status(200).json(updatedUser);
    } catch (e) {
        res.status(500).json(
            createErrorMessage(
                'Internal Server Error',
                500,
                `An error occurred while completing the profile: ${e}`
            )
        )
    }
}

const verifyPassword = async (req: e.Request, res: e.Response) => {
    try {
        const {password} = req.body;
        const allHeaders = await getHeader(req, res);
        if (!allHeaders) {
            return;
        }
        const {UserId} = allHeaders;
        if (!password) {
            res.status(400).json(
                createErrorMessage(
                    'Bad Request',
                    400,
                    'Missing password in request body'
                )
            )
        }
        const authService = new AuthService();
        const {user, isProfileSetUpDone} = await authService.logInWithEmailAndPassword(
            UserId,
            password
        );
        if (!user) {
            res.status(401).json(
                createErrorMessage(
                    'Unauthorized',
                    401,
                    'Invalid email or password'
                )
            )
            return;
        }
        res.status(200).json({user, isProfileSetUpDone});
    } catch (error) {
        res.status(500).json(
            createErrorMessage(
                'Internal Server Error',
                500,
                `An error occurred while verifying the password: ${error}`
            )
        )
    }
}

export = {longInOrRegisterUser, completeProfile, verifyPassword};