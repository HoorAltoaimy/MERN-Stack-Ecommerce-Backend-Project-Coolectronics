import {Router} from 'express';
import { activateUser, deleteUser, forgetPassword, getAllUsers, getSingleUser, processRegisterUser, resetPassword, updateUser, banUser, unbanUser } from '../controllers/usersController';
import { uploadUserImg } from '../middlewares/uploadFile';
import { isAdmin, isLoggedIn, isLoggedOut } from '../middlewares/authentication';
import { validateActivateUser, validateRegisterUser, validateUpdateUser } from '../validation/validator';
import { runValidation } from '../validation/runVaildator';

const usersRouter = Router();

// ! add authentication

// usersRouter.get('/', isLoggedIn, isAdmin, getAllUsers)

// usersRouter.post('/process-register', isLoggedOut, uploadUserImg.single('image'), processRegisterUser)

// usersRouter.post('/activate', isLoggedOut, activateUser)

// usersRouter.get('/:id', isLoggedIn, getSingleUser)

// usersRouter.delete('/:id', isLoggedIn, isAdmin, deleteUser)

// usersRouter.put('/update-user-info/:slug', isLoggedIn, updateUser)

// usersRouter.put('/ban/:id', isLoggedIn, isAdmin, banUser)

// usersRouter.put('/ban/:id', isLoggedIn, isAdmin, banUser)

// usersRouter.put('/unban/:id', isLoggedIn, isAdmin, unbanUser)

// usersRouter.put('/unban/:id', isLoggedIn, isAdmin, unbanUser)

usersRouter.get('/', getAllUsers)

usersRouter.post('/process-register', uploadUserImg.single('image'), validateRegisterUser, runValidation, processRegisterUser)

usersRouter.post('/activate', validateActivateUser, runValidation, activateUser)

usersRouter.get('/:id',getSingleUser)

usersRouter.delete('/:id',deleteUser)

usersRouter.put('/update-user-info/:id', uploadUserImg.single('image'), validateUpdateUser, runValidation, updateUser)

usersRouter.put('/ban/:id', banUser)

usersRouter.put('/unban/:id',unbanUser)

usersRouter.post('/forget-password', forgetPassword)

usersRouter.put('/change-password/reset-password', resetPassword)

export default usersRouter
