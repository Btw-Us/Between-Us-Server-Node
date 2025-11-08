const express = require('express');
const authRoutes = express.Router();
const { longInOrRegisterUser,completeProfile,verifyPassword } = require('./auth.controller');
const {checkUserNameExists} = require('../user/search/user.search.controller');

authRoutes.post('/google' ,longInOrRegisterUser);
authRoutes.post('/google/complete', completeProfile);
authRoutes.post('/google/verify',verifyPassword);
authRoutes.get('/checkUsernameAvailability/:username',checkUserNameExists);

export = authRoutes;
