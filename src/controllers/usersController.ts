import { Request, Response, NextFunction } from 'express'
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'

import User, { UserInterface } from '../models/userSchema'
import { dev } from '../config'
import { handleSendEmail } from '../helper/sendEmail'
import { banUserById, deleteUserById, findAllItems, findItemById, grantRoleById, unbanUserById } from '../services/usersServices'
import { UserType } from '../types'
import { deleteImageHelper } from '../helper/deleteImages'
import { createJsonWebToken, verifyJsonWebToken } from '../helper/jwtHelper'
import ApiError from '../errors/ApiError'
import {
  deleteFromcloudinary,
  uploadToCloudinary,
  valueWithoutExtension,
} from '../helper/cloudinaryHelper'

cloudinary.config({
  cloud_name: dev.cloud.cloudinaryName,
  api_key: dev.cloud.cloudinaryApiKey,
  api_secret: dev.cloud.cloudinaryApiSecret,
})

const successResponse = (res: Response, statusCode = 200, message = 'successful', payload = {}) => {
  res.status(statusCode).send({
    message,
    payload: payload,
  })
}

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const search = req.query.search as string

    const { users, totalPages, currentPage } = await findAllItems(page, limit, search)

    // ! add pagination
    successResponse(res, 200, 'All users are returned', { users, totalPages, currentPage })
  } catch (error) {
    next(error)
  }
}

export const getSingleUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const user = await findItemById(id)

    if (!user) {
      throw new ApiError(404, `No user found with this ${id}`)
    }

    successResponse(res, 200, 'Single user is returned', user)
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'User id format is invalid')
      next(error)
    } else {
      next(error)
    }
  }
}

export const banUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await banUserById(req.params.id)
    successResponse(res, 200, 'User is banned')
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'no user found with this id')
      next(error)
    } else {
      next(error)
    }
  }
}

export const unbanUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await unbanUserById(req.params.id)
    successResponse(res, 200, 'User is unbanned')
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'no user found with this id')
      next(error)
    } else {
      next(error)
    }
  }
}

export const grantRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await grantRoleById(req.params.id)
    successResponse(res, 200, 'User is changed to an admin')
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'No user found with this id')
      next(error)
    } else {
      next(error)
    }
  }
}

export const processRegisterUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, address, phone } = req.body
    const imagePath = req.file?.path

    const hashedPassword = await bcrypt.hash(password, 10)

    const tokenPayload: UserType = {
      username,
      email,
      password: hashedPassword,
      address,
      phone,
    }

    if (imagePath) {
      tokenPayload.image = imagePath
    }

    const token = await createJsonWebToken(
      tokenPayload,
      String(dev.app.jwtUserActivationKey),
      '10m'
    )

    const emailData = {
      email,
      subject: 'Activate your email',
      html: `<h1> Hello ${username}</h1>
            <p> Please activate your account by clicking on the following link: 
            <a href="http://localhost:3000/users/activate/${token}">
            clicking on the following link </a></p>`,
    }

    await handleSendEmail(emailData)

    successResponse(res, 200, 'Check your email inbox to activate your account', token)
  } catch (error) {
    next(error)
  }
}

export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body

    if (!token) {
      throw new ApiError(404, 'Please provide a token')
    }

    const decodedToken = (await verifyJsonWebToken(
      token,
      String(dev.app.jwtUserActivationKey)
    )) as JwtPayload

    if (!decodedToken) {
      throw new ApiError(404, 'Invalid token')
    }

    try {
      //decodedToken.image -> store in cloudinary -> return a url
      const cloudinaryUrl = await uploadToCloudinary(
        decodedToken.image,
        'Ecommerce-cloudinary/users'
      )
      decodedToken.image = cloudinaryUrl

      await User.create(decodedToken)

      successResponse(res, 201, 'User is registered successfully')
    } catch (error: any) {
      next(error.message)
    }
  } catch (error) {
    if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
      const errorMessage =
        error instanceof TokenExpiredError ? 'Your token has expired' : 'invalid token'
      next(new ApiError(401, errorMessage))
    } else {
      next(error)
    }
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id

    // const user = await User.findOne({ _id: id })
    // if (!user) {
    //   throw new ApiError(404, 'User not found')
    // }

    // if (user && user.image) {
    //   //delete image from the local server
    //   //   if (user.image !== "public/images/usersImages/defaultUserImage.png") {
    //   //     await deleteImageHelper(user.image);
    //   //   }

    //   //delete image from cloudinary
    //   const publicId = await valueWithoutExtension(user.image)
    //   await deleteFromcloudinary(`Ecommerce-cloudinary/users/${publicId}`)
    // }

    //await User.findByIdAndDelete(id)

    const product = await deleteUserById(id)

    successResponse(res, 200, `User ${id} is deleted`)
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'User id format is invalid')
      next(error)
    } else {
      next(error)
    }
  }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const user = await User.findById(id)
    if (!user) {
      throw new ApiError(404, `No user found with this id ${id}`)
    }

    const { username, email, address, phone } = req.body 
    let image = req.file && req.file.path

    if (image) {
      const cloudinaryUrl = await uploadToCloudinary(
        image,
        'Ecommerce-cloudinary/users'
      )
      image = cloudinaryUrl
    }

    const updatedUserData: Partial<UserInterface> = {
      username,
      email,
      image,
      address,
      phone,
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true })

    if (updatedUser) {
      successResponse(res, 200, `User ${id} is updated`, updatedUser)
      
      if (user.image) {
        const publicId = await valueWithoutExtension(user.image)
        await deleteFromcloudinary(`Ecommerce-cloudinary/users/${publicId}`)
      }
    } else {
      throw new Error(`No user found with this id ${id}`)
    }
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'User id format is invalid')
      next(error)
    } else {
      next(error)
    }
  }
}

export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const user = await User.findById(id)
    if (!user) {
      throw new ApiError(404, `No user found with this id ${id}`)
    }

    const { username, email } = req.body
    let image = req.file && req.file.path

    if (image) {
      const cloudinaryUrl = await uploadToCloudinary(
        image,
        'Ecommerce-cloudinary/users'
      )
      image = cloudinaryUrl
    }

    const updatedUserData: Partial<UserInterface> = {
      username,
      email,
      image,
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true })

    if (updatedUser) {
      successResponse(res, 200, `User ${id} is updated`, updatedUser)
      
      if (user.image) {
        const publicId = await valueWithoutExtension(user.image)
        await deleteFromcloudinary(`Ecommerce-cloudinary/users/${publicId}`)
      }
    } else {
      throw new Error(`No user found with this id ${id}`)
    }
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'User id format is invalid')
      next(error)
    } else {
      next(error)
    }
  }
}

export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      throw new ApiError(409, 'No user exists with this email')
    }

    const token = await createJsonWebToken({ email }, String(dev.app.jwtResetPasswordKey), '10m')

    const emailData = {
      email,
      subject: 'Reset password',
      html: `<h1> Hello ${user.username}</h1>
            <p> Please click on the following link: 
            <a href="http://localhost:3000/users/reset-password/${token}"> Reset </a>
            to reset
            </p>`,
    }
    await handleSendEmail(emailData)

    successResponse(res, 200, 'Please check your email to reset', token)
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body

    const decoded = (await verifyJsonWebToken(
      token,
      String(dev.app.jwtResetPasswordKey)
    )) as JwtPayload

    if (!decoded) {
      throw new ApiError(400, 'invalid token')
    }

    const updatedPassword = await User.findOneAndUpdate(
      { email: decoded.email },
      { $set: { password: bcrypt.hashSync(password, 10) } },
      { new: true }
    )

    if (!updatedPassword) {
      throw new ApiError(400, 'Password reset is unsuccessful')
    }

    successResponse(res, 200, 'Password reseted successfully')
  } catch (error) {
    next(error)
  }
}
