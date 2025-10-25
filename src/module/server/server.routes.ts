const { createServerToken, getAllServerTokens } = require('./server.controller');
const express = require('express');
const serverRoutes = express.Router();

serverRoutes.post('/generate', createServerToken);

serverRoutes.get('/', getAllServerTokens);

export = serverRoutes;