const { createServerToken } = require('./server.controller');
const express = require('express');
const serverRoutes = express.Router();

serverRoutes.post('/generate', createServerToken);

export = serverRoutes;