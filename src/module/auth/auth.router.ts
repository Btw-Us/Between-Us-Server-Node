import express from 'express';
import { signIn, signUp} from './auth.controller.js';

const AuthRoutes = express.Router();



AuthRoutes.post('/mobile/signin', signIn);
AuthRoutes.post('/mobile/signup', signUp);

export default AuthRoutes;

