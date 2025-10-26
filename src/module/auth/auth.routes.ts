const express = require('express');
const authRoutes = express.Router();
const { longInOrRegisterUser,completeProfile,verifyPassword } = require('./auth.controller');
const {checkAdminHeader,checkDeviceIntegrity} = require('../../middleware/headers.middleware');

authRoutes.post('/google',checkAdminHeader ,longInOrRegisterUser);
authRoutes.post('/google/complete',checkDeviceIntegrity, completeProfile);
authRoutes.post('/google/verify', checkDeviceIntegrity,verifyPassword);

export = authRoutes;
