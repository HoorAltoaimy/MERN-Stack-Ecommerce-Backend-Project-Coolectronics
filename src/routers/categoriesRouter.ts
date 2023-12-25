import express from 'express'

import * as categories from '../controllers/categoriesController'
import { validateCategory } from '../validation/validator'
import { runValidation } from '../validation/runVaildator'
import { isAdmin, isLoggedIn } from '../middlewares/authentication'

const categoriesRouter = express.Router()

//isLoggedIn, isAdmin,
categoriesRouter.get('/', categories.getAllCategories)

categoriesRouter.post('/', validateCategory, runValidation, categories.createCategory)

categoriesRouter.get('/:slug', categories.getSingleCategoryBySlug)

categoriesRouter.put('/:id', validateCategory, runValidation, categories.updateCategoryById)

categoriesRouter.delete('/:id', categories.deletCategoryById)

export default categoriesRouter
