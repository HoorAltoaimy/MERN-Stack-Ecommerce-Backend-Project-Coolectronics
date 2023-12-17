import { Request, Response, NextFunction } from "express";
import {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import slugify from "slugify";

import User from "../models/userSchema";
import { dev } from "../config";
import { handleSendEmail } from "../helper/sendEmail";
import {
  banUserById,
  findAllItems,
  findItemById,
  unbanUserById,
} from "../services/userServices";
import { UserType } from "../types";
import { deleteImageHelper } from "../helper/deleteImages";
import { createJsonWebToken, verifyJsonWebToken } from "../helper/jwtHelper";
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

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const search = req.query.search as string;

    const { users, totalPages, currentPage } = await findAllItems(
      page,
      limit,
      search
    );

    // ! add pagination
    successResponse(res, 200, 'All users are returned', {users, totalPages, currentPage})
  } catch (error) {
    next(error);
  }
};

export const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id
    const user = await findItemById(id);

    if(!user){
      throw new ApiError(404, `No user found with this ${id}`);
    }

    successResponse(res, 200, "Single user is returned", user);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error =  new ApiError(404, "Wrong id!");
      next(error);
    } else {
      next(error);
    }
  }
};

export const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await banUserById(req.params.id);
    successResponse(res, 200, "User is banned");
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, "no user found with this id");
      next(error);
    } else {
      next(error);
    }
  }
};

export const unbanUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await unbanUserById(req.params.id);
    successResponse(res, 200, "User is unbanned");
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, "no user found with this id");
      next(error);
    } else {
      next(error);
    }
  }
};

export const processRegisterUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, address, phone } = req.body;
    const imagePath = req.file?.path;

    const hashedPassword = await bcrypt.hash(password, 10);

    const tokenPayload: UserType = {
      username,
      email,
      password: hashedPassword,
      address,
      phone,
    };

    if (imagePath) {
      tokenPayload.image = imagePath;
    }

    const token = await createJsonWebToken(tokenPayload, String(dev.app.jwtUserActivationKey), '10m')

    const emailData = {
      email,
      subject: "Activate your email",
      html: `<h1> Hello ${username}</h1>
            <p> Please activate your account by clicking on the following link: 
            <a href="http://localhost:3000/users/activate/${token}">
            clicking on the following link </a></p>`,
    };

    await handleSendEmail(emailData);

    successResponse(res, 200, "Check your email inbox to activate your account");

  } catch (error) {
    next(error);
  }
};

export const activateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.body;
   
    if (!token) {
      throw new ApiError(404, "Please provide a token");
    }

    const decodedToken = await verifyJsonWebToken(token,
      String(dev.app.jwtUserActivationKey)) 

    if (!decodedToken) {
      throw new ApiError(404, "Invalid token");
    }

    await User.create(decodedToken);

    successResponse(res, 201, "User is registered successfully");
  } catch (error) {
    if (
      error instanceof TokenExpiredError ||
      error instanceof JsonWebTokenError
    ) {
      const errorMessage =
        error instanceof TokenExpiredError
          ? "Your token has expired"
          : "invalid token";
      next(new ApiError(401, errorMessage));
    } else {
      next(error);
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id); 

    if (user && user.image) {
      if (user.image !== "public/images/usersImages/defaultUserImage.png") {
        await deleteImageHelper(user.image);
      }
    }

    successResponse(res, 200, `User ${id} is deleted`);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, "Wrong id");
      next(error);
    } else {
      next(error);
    }
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const { username, email, password, address, phone } = req.body;
    const imagePath = req.file?.path;

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUserData: UserType = {
      username,
      email,
      password: hashedPassword,
      address,
      phone,
    };

    if (imagePath) {
      updatedUserData.image = imagePath;
    }
    else{
      updatedUserData.image = dev.app.usersImgPath
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updatedUserData,
      { new: true }
    );
   
    if (updatedUser) {
      successResponse(res, 200, `User ${id} is updated`, updatedUser);
    } else {
      throw new Error(`No user found with this id ${id}`);
    }
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, "Wrong id");
      next(error);
    } else {
      next(error);
    }
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //1-get the email
    const { email } = req.body;

    //2-check the existance of the email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(409, "No user exists with this email");
    }

    //3-create a token
    const token = await createJsonWebToken({email}, String(dev.app.jwtResetPasswordKey), '10m')


    //4-send an email
    const emailData = {
      email,
      subject: "Reset password",
      html: `<h1> Hello ${user.username}</h1>
            <p> Please click on the following link: 
            <a href="http://localhost:3001/users/reset-password/${token}"> reset </a>
            to reset
            </p>`, //put the frontend url instead
    };
    await handleSendEmail(emailData);

    successResponse(res, 200, "Please check your email to reset", token);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;

    const decoded = await verifyJsonWebToken(token,
      String(dev.app.jwtResetPasswordKey)) as JwtPayload;

    if (!decoded) {
      throw new ApiError(400, "invalid token");
    }

    const updatedPassword = await User.findOneAndUpdate(
      { email: decoded.email },
      { $set: { password: bcrypt.hashSync(password, 10) } },
      { new: true }
    );
        console.log(updatedPassword);
    if(!updatedPassword){
      throw new ApiError(400, "Password reset is unsuccessful");
    }

    successResponse(res, 200, "Password reseted successfully");
  } catch (error) {
    next(error)
  }
};
