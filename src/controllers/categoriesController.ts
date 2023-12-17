import { NextFunction, Request, Response } from 'express'
import slugify from 'slugify'
import mongoose from 'mongoose'

import { Category } from '../models/categorySchema'
import ApiError from '../errors/ApiError'

const successResponse = (res: Response, statusCode = 200, message = 'successful', payload = {}) => {
  res.status(statusCode).send({
    message,
    payload: payload,
  })
}

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find()

    if (categories.length !== 0) {
      successResponse(res, 200, 'return all categories', categories)
    } else {
      throw new ApiError(404, 'No categories found')
    }
  } catch (error) {
    next(error)
  }
}

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body

    const categoryExist = await Category.exists({ title })
    if (categoryExist) {
      throw new ApiError(404, 'Category alrady exist with this title')
    }

    const newCategory = new Category({
      title,
      slug: slugify(title),
    })
    await newCategory.save()

    successResponse(res, 201, 'New category is created', newCategory)
  } catch (error) {
    next(error)
  }
}

export const getSingleCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params
    const category = await Category.findOne({ slug })

    if (!category) {
      throw new ApiError(404, `No category found with this slug ${slug}`)
    }

    successResponse(res, 200, 'Single category is rendered', category)
  } catch (error) {
      next(error)
  }
}

export const deletCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      throw new ApiError(404, `No category found with this id ${id}`)
    }

    successResponse(res, 200, `Category ${id} is deleted`, category)
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'Wrong id format')
      next(error)
    } else {
      next(error)
    }
  }
}

export const updateCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }

    const id = req.params.id
    const updatedCategoryData = req.body
    const updatedCategory = await Category.findByIdAndUpdate(id, updatedCategoryData, { new: true })

    if (!updatedCategory) {
      throw new ApiError(404, `No category found with this id ${id}`)
    }

    successResponse(res, 200, `Category ${id} is updated`, updatedCategory)
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      const error = new ApiError(404, 'Wrong id format')
      next(error)
    } else {
      next(error)
    }
  }
}
