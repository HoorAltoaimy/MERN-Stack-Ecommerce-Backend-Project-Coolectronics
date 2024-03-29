import { Router } from 'express'

import * as products from '../controllers/productsController'
import { isAdmin, isLoggedIn } from '../middlewares/authentication'
import { runValidation } from '../validation/runVaildator'
import { uploadProductImg } from '../middlewares/uploadFile'
import { validateCreateProduct, validateUpdateProduct } from '../validation/validator'

const productsRouter = Router()

productsRouter.get('/', products.getAllProducts)

productsRouter.post('/filter-products', products.filterProducts)

productsRouter.get('/singleProduct/:slug', products.getSingleProductBySlug)

productsRouter.post(
  '/',
  isLoggedIn,
  isAdmin,
  uploadProductImg.single('image'),
  validateCreateProduct,
  runValidation,
  products.createProduct
)

productsRouter.delete('/:id', isLoggedIn, isAdmin, products.deleteProduct)

productsRouter.put(
  '/update-product-info/:id',
  isLoggedIn,
  isAdmin,
  uploadProductImg.single('image'),
  validateUpdateProduct,
  runValidation,
  products.updateProduct
)

export default productsRouter
