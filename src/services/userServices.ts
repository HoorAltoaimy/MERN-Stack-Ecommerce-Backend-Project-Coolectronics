import ApiError from "../errors/ApiError"
import User, { UserInterface } from "../models/userSchema"

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

export const deleteItemBySlug = async (id: string) => {
    const user = await User.findOneAndDelete({id }) 
        
    if(!user){
        throw new ApiError(404, `No user found with this slug ${id}`)
    }
    return user
}
