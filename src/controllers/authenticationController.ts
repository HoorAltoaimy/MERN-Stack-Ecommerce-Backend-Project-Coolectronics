import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'

import User from "../models/userSchema";
import { dev } from "../config";
import ApiError from "../errors/ApiError";

const successResponse = (
    res: Response,
    statusCode = 200,
    message = "successful",
    payload = {}
  ) => {
    res.status(statusCode).send({
      message,
      payload: payload,
    });
  };

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {email, password } = req.body

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404, 'No user found with this email')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if(!passwordMatch){
        throw new ApiError(401, 'Password does not match') 
    }

    if(user.isBanned){
        throw new ApiError(403, 'User is banned') 
    }

    const accessToken = JWT.sign({_id: user._id}, String(dev.app.jwtAccessKey), {expiresIn: '3h'})

    res.cookie('access_token', accessToken, {maxAge: 3 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true}) 


    successResponse(res, 200, 'user is logged in', user)
  } catch (error) {
    next(error);
  }
};

export const handleLogout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.clearCookie('access_token')
      res.send({ message: "user is logged out"});
    } catch (error) {
      next(error);
    }
  };
