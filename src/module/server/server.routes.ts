import express from 'express';
import {createServerTokenHandler} from './server.controller.js';

const ServerRoutes = express.Router();

ServerRoutes.post('/create', createServerTokenHandler);
ServerRoutes.get('/', (req, res) => {
    res.status(403).json({
        error: 'Forbidden',
        message: 'Get is Prohibited on /server. To See all created server tokens, please use the PocketBase Admin Panel.'
    });
});

export default ServerRoutes;
