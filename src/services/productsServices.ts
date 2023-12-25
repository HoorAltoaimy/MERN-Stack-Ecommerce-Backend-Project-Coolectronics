import ApiError from '../errors/ApiError'
import { deleteFromcloudinary, valueWithoutExtension } from '../helper/cloudinaryHelper'
import { Product, ProductInterface } from '../models/productSchema'

export const findAllProducts = async (page = 1, limit = 3, search = '', categoryFilter='') => {
  const searchRegExp = new RegExp('.*' + search + '.*', 'i')

  let filter = {}
  categoryFilter
    ? (filter = {
        category: { $eq: categoryFilter },
        $or: [{ title: { $regex: searchRegExp } }, { description: { $regex: searchRegExp } }],
      })
    : (filter = {
        $or: [{ title: { $regex: searchRegExp } }, { description: { $regex: searchRegExp } }],
      })

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
    .sort({ price: 1 })
    .populate('category')

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
    //local server
    // if (product.image !== 'public/images/productsImages/defaultProductImage.png') {
    //   await deleteImage(product.image)
    // }

    //cloudinary 
    const publicId = await valueWithoutExtension(product.image)
    await deleteFromcloudinary(`Ecommerce-cloudinary/products/${publicId}`)
  }

  return product
}
