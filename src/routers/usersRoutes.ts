import {Router} from 'express';

import * as users from '../controllers/usersController';
import { uploadUserImg } from '../middlewares/uploadFile';
import { isAdmin, isLoggedIn, isLoggedOut } from '../middlewares/authentication';
import { validateActivateUser, validateRegisterUser } from '../validation/validator';
import { runValidation } from '../validation/runVaildator';

const usersRouter = Router();

usersRouter.get('/', isLoggedIn, isAdmin, users.getAllUsers)

usersRouter.post('/process-register', uploadUserImg.single('image'), validateRegisterUser, runValidation, users.processRegisterUser)

usersRouter.post('/activate', isLoggedOut, validateActivateUser, runValidation, users.activateUser)

usersRouter.get('/:id', isLoggedIn, users.getSingleUser)

usersRouter.delete('/:id', isLoggedIn, isAdmin, users.deleteUser)

usersRouter.put('/update-user-info/:id', isLoggedIn, uploadUserImg.single('image'), users.updateUser)

usersRouter.put('/update-admin-info/:id', isLoggedIn, uploadUserImg.single('image'), users.updateAdmin)

usersRouter.put('/ban/:id', isLoggedIn, isAdmin, users.banUser)

usersRouter.put('/unban/:id', isLoggedIn, isAdmin, users.unbanUser)

usersRouter.put('/grantRole/:id', isLoggedIn, isAdmin, users.grantRole)

usersRouter.post('/forget-password', users.forgetPassword)

usersRouter.put('/reset-password', users.resetPassword)

export default usersRouter
