import { NextFunction, Request, Response } from 'express'
import ApiError from '../errors/ApiError'
import { Users } from '../models/xusersSchema'
import { dev } from '../config'
import Jwt, { JwtPayload } from 'jsonwebtoken'

export interface CustomRequest extends Request {
  userId?: string
}

export const isLoggedIn = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.access_token

    if (!accessToken) {
      throw ApiError.badRequest(401, 'You are not logged in')
    }

    //const decoded = Jwt.verify(accessToken, dev.app.secret_key) as JwtPayload
    const decoded = Jwt.verify(accessToken, String(dev.app.jwtAccessKey)) as JwtPayload
    if (!decoded) {
      throw ApiError.badRequest(401, 'Invalied access token')
    }
    console.log('user id' + decoded._id)
    req.userId = decoded._id

    next()
  } catch (error) {
    next(error)
  }
}

export const isLoggedOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.access_token
    if (accessToken) {
      throw ApiError.badRequest(401, 'You are already logged in')
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const isAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw ApiError.badRequest(401, 'User ID is missing')
    }

    const user = await Users.findById(req.userId)

    if (user && user.isAdmin) {
      next()
    } else {
      throw ApiError.badRequest(403, `You are not an admin `)
    }
  } catch (error) {
    next(error)
  }
}
