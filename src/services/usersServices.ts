import bcrypt from "bcrypt";

import ApiError from "../errors/ApiError"
import User, { UserInterface } from "../models/userSchema"
import { deleteFromcloudinary, uploadToCloudinary, valueWithoutExtension } from "../helper/cloudinaryHelper";
import mongoose from "mongoose";

export const findAllItems = async (page = 1, limit = 3, search = '') => {
    const count = await User.countDocuments()
    const totalPages = Math.ceil(count / limit)

    const searchRegExp = new RegExp('.*' + search + '.*', 'i') //.* means can be there anything before and after the searched word -> e.g. if search = iphone, the results show iphone 13, iphone 14, iphone 15... //i-> ignore the case
    const filter = {
        isAdmin: {$ne: true},
        $or: [
            { username: {$regex: searchRegExp}},
            { email: {$regex: searchRegExp}},
            { phone: {$regex: searchRegExp}},
        ]
    }

    const options = {
        password: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0
    }

    if(page > totalPages){
        page = totalPages
    }

    const skip = (page-1) * limit 
    const users: UserInterface[] = await User.find(filter, options).skip(skip).limit(limit).sort({username: +1}) 
    
    return {
        users,
        totalPages, 
        currentPage: page
    }
}

export const findItemById = async (id: string): Promise<UserInterface> => { 
    const user = await User.findById(id, {password: 0})
    
    if(!user){ 
        throw new ApiError(404, `No user found with this id ${id}`)
    }
    return user
}

export const banUserById = async (id: string) => { 
    const user = await User.findByIdAndUpdate(id, {isBanned: true})
    
    if(!user){ 
        throw new ApiError(404, `No user found with this id ${id}`)
    }
}

export const unbanUserById = async (id: string) => { 
    const user = await User.findByIdAndUpdate(id, {isBanned: false})
    
    if(!user){ 
        throw new ApiError(404, `No user found with this id ${id}`)
    }
}

export const deleteUserById = async (id: string) => {
    const user = await User.findByIdAndDelete(id)
  
    if (!user) {
      throw new ApiError(404, `No user found with this id ${id}`)
    }
  
    if (user && user.image) {
      //local server
      // if (product.image !== 'public/images/productsImages/defaultProductImage.png') {
      //   await deleteImage(product.image)
      // }
  
      //cloudinary 
      const publicId = await valueWithoutExtension(user.image)
      await deleteFromcloudinary(`Ecommerce-cloudinary/users/${publicId}`)
    }
  
    return user
  }

// export const updateUserById = async (id: string, req: Request): Promise<UserInterface> => {
//     try {
//         const user = await User.findById(id) 
//         if(!user){
//             throw new ApiError(404, `No user found with this id ${id}`)
//         }

//         const allowedFields = ['name', 'password', 'phone', 'address', 'image']
//         const updates: Record<string, unknown> = {}

//         for(const key in req.body){
//             if(allowedFields.includes(key)){
//                 if(key === 'password'){
//                     const hashedPassword = await bcrypt.hash(req.body[key], 10)
//                     updates[key] = hashedPassword
//                 }
//                 else{
//                     updates[key] = req.body[key]
//                 }
//             }
//             else{
//                 throw new ApiError(404, `${key} can not be updated`)
//             }
//         }

//         const image = req.file && req.file.path
//         if(image){
//             updates.image = await uploadToCloudinary(image, 'Ecommerce-cloudinary/users')
//         }

//         const updatedUserData = await User.findByIdAndUpdate(id, updates, {new: true}).select('-password')

//         if(!updatedUserData){
//             throw new ApiError(400, 'User data could not be updated')
//         }

//         if(user.image){
//             const publicId = await valueWithoutExtension(user.image)
//       await deleteFromcloudinary(`Ecommerce-cloudinary/users/${publicId}`)
//         }

//         return updatedUserData
//     } catch (error) {
//         throw error
//     }
// }
