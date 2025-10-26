const express = require('express');
const authRoutes = express.Router();
const { longInOrRegisterUser } = require('./auth.controller');

authRoutes.post('/google', longInOrRegisterUser);

export = authRoutes;
