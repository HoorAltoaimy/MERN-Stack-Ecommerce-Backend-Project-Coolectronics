import express from 'express'

import * as user from '../controllers/xusersController'
import { runValidation } from '../validation/runVaildator'
//import { validateuser } from '../middlewares/validator'
import { uploadUserImg } from '../middlewares/uploadFile'
import { isAdmin, isLoggedIn, isLoggedOut } from '../middlewares/authentication'

const usersRouter = express.Router()

// router.get('/', isLoggedIn,isAdmin,user.getAllUsers)

// router.get('/:id',isLoggedIn,user.getOneUser)

// router.post('/',uploadUserImg.single('image'),validateuser,runValidation,user.newUser)

// router.put('/:id' , isLoggedIn,user.updateUser)

// router.put("/user/ban/:id",isLoggedIn,isAdmin,user.updateBan)

// router.delete("/user/delete/:id",isLoggedIn,isAdmin,user.deleteSingleUser)

// router.get('/user/activate/:token',user.activateUser)

// router.post('/user/forget-password',isLoggedOut,user.forgotPassword)

// router.put('/user/reset-password',user.resetPassword)

usersRouter.get('/', isLoggedIn, isAdmin, user.getAllUsers)

//POST: /users/process-register -> register a new user
usersRouter.post('/process-register', isLoggedOut, uploadUserImg.single('image'), user.processRegisterUser)

usersRouter.post('/activate', isLoggedOut, user.activateUser)

usersRouter.get('/:id', isLoggedIn, user.getSingleUser)

usersRouter.delete('/:id', isLoggedIn, isAdmin, user.deleteUser)

usersRouter.put('/update-user-info/:slug', isLoggedIn, user.updateUser)

usersRouter.put('/ban/:id', isLoggedIn, isAdmin, user.updateBan)

usersRouter.post('/forget-password', user.forgetPassword)

usersRouter.put('/change-password/reset-password', user.resetPassword)

//-----------------------------------------------
usersRouter.post('/login',user.loginUser)

usersRouter.post('/logout', isLoggedIn,user.logoutUser)

export default usersRouter

