import express from 'express'

import { isLoggedIn } from '../middlewares/authentication'

import { getAllmessageOfUser, sendMessage } from '../controllers/chatController'

export const chatRoute = express.Router()

chatRoute.post('/', isLoggedIn, sendMessage)
chatRoute.get('/', isLoggedIn, getAllmessageOfUser)
