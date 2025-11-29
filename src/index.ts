import express from 'express';
import 'dotenv/config';

import { ServerApiRoutes } from './utils/routePaths.js';
import { createTokenHandler } from './controllers/serverTokenController.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post(ServerApiRoutes.Token.GenerateServerToken, createTokenHandler);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
