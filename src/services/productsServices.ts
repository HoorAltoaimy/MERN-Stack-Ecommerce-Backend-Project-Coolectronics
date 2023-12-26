import ApiError from '../errors/ApiError'
import { deleteFromcloudinary, valueWithoutExtension } from '../helper/cloudinaryHelper'
import { Product, ProductInterface } from '../models/productSchema'

export const findAllProducts = async (page = 1, limit = 3, search = '') => {
  const searchRegExp = new RegExp('.*' + search + '.*', 'i')

  const filter = {
    search: {$or: [
      {title: {$regx: searchRegExp}},
      {description: { $regex: searchRegExp }}
    ]}
  }

  const count = await Product.countDocuments()
  if (count <= 0) {
    throw new ApiError(404, 'No products found')
  }

  const totalPages = Math.ceil(count / limit)
  if (page > totalPages) {
    page = totalPages
  }

  const skip = (page - 1) * limit

  const products: ProductInterface[] = await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('category');
    //.sort({ price: 1 }) //sorted in the front end

  if (products.length === 0) {
    throw new ApiError(404, 'No products found')
  }
  
  return {
    products,
    count,
    totalPages,
    currentPage: page,
  }
}

export const findFilteredProducts = async (page: number, limit: number, search: string, selectedCategories: string[], priceRange: string[]) => {
  const searchRegExp = new RegExp('.*' + search + '.*', 'i')

  const filter = {
    category: {},
    price: {},
    search: {$or: [
      {title: {$regx: searchRegExp}},
      {description: { $regex: searchRegExp }}
    ]}
  }

  if(selectedCategories && selectedCategories.length > 0){
    filter.category = {$in: selectedCategories}
  }

  if(priceRange && priceRange.length > 0){
    filter.price = {$gte: priceRange[0], $lte: priceRange[1]}
  }

  const count = await Product.countDocuments(filter)
  if (count <= 0) {
    throw new ApiError(404, 'No products found')
  }

  const totalPages = Math.ceil(count / limit)
  if (page > totalPages) {
    page = totalPages
  }

  const skip = (page - 1) * limit

  const products: ProductInterface[] = await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .populate('category');

  if (products.length === 0) {
    throw new ApiError(404, 'No products found')
  }
  
  return {
    products,
    count,
    totalPages,
    currentPage: page,
  }
}

export const findProductBySlug = async (slug: string): Promise<ProductInterface> => {
  const product = await Product.findOne({ slug })
  if (!product) {
    throw new ApiError(404, `No product found with this slug ${slug}`)
  }

  return product
}

export const deleteProductById = async (id: string) => {
  const product = await Product.findByIdAndDelete(id)

  if (!product) {
    throw new ApiError(404, `No product found with this id ${id}`)
  }

  if (product && product.image) {
    const publicId = await valueWithoutExtension(product.image)
    await deleteFromcloudinary(`Ecommerce-cloudinary/products/${publicId}`)
  }

  return product
}
