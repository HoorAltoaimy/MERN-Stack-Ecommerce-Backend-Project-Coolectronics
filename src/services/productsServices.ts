import { Product, ProductInterface } from '../models/product'
import { createError } from '../utility/createError'

export const findAllProducts = async (page = 1, limit = 3) => {
  const count = await Product.countDocuments()
  if (count <= 0) {
    const error = createError(404, 'No products found')
    throw error
  }

  const totalPages = Math.ceil(count / limit)
  if (page > totalPages) {
    page = totalPages
  }

  const skip = (page - 1) * limit
  const products: ProductInterface[] = await Product.find()
    .skip(skip)
    .limit(limit)
    .sort({ price: +1 }) //add .populate('category')
  if (products.length === 0) {
    const error = createError(404, 'No products found')
    throw error
  }

  return {
    products,
    totalPages,
    currentPage: page,
  }
}

export const filterProductsByPrice = async (page = 1, limit = 3) => {
  const skip = (page - 1) * limit

  const products: ProductInterface[] = await Product.find({ price: { $lte: 500 } })
    .skip(skip)
    .limit(limit) //add .populate('category')
  if (products.length === 0) {
    const error = createError(404, 'No products found')
    throw error
  }

  return {
    products,
  }
}

export const findProductBySlug = async (slug: string): Promise<ProductInterface> => {
  const product = await Product.findOne({ slug })
  if (!product) {
    const error = createError(404, `No product found with this slug ${slug}`)
    throw error
  }

  return product
}

export const deleteProductBySlug = async (slug: string) => {
  const product = await Product.findOneAndDelete({ slug })
  if (!product) {
    const error = createError(404, `No product found with this slug ${slug}`)
    throw error
  }

  return product
}
