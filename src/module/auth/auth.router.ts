import express from 'express';
import { sendVerificationEmail, signIn, signUp} from './auth.controller.js';

const AuthRoutes = express.Router();



AuthRoutes.post('/mobile/signin', signIn);
AuthRoutes.post('/mobile/signup', signUp);
AuthRoutes.post('/mobile/verify-email', sendVerificationEmail);

export default AuthRoutes;

