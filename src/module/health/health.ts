import Router = require("express");

const heathRoute = Router();

heathRoute.get('/', (req, res) => {
    res.status(200).send({
        status: 'You are autherized to access this resource.',
        timestamp: new Date().toISOString()
    });
});

export = heathRoute;