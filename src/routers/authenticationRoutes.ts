import {Router} from 'express';

import { isLoggedOut } from '../middlewares/authentication';
import { handleLogin, handleLogout } from '../controllers/authenticationController';

const authenticationRouter = Router();

authenticationRouter.post('/login', isLoggedOut, handleLogin)

authenticationRouter.post('/logout', handleLogout)

export default authenticationRouter
