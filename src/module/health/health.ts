import Router = require("express");

const heathRoute = Router();

heathRoute.get('/', (req, res) => {
    res.status(200).send('OK');
});

export = heathRoute;