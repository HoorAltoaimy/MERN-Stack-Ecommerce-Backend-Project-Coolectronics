import { NextFunction, Request, Response } from 'express'
import slugify from 'slugify'

import ApiError from '../errors/ApiError'
import { Product, ProductInterface } from '../models/productSchema'
import { deleteProductById, findAllProducts } from '../services/productsServices'
import {
  deleteFromcloudinary,
  uploadToCloudinary,
  valueWithoutExtension,
} from '../helper/cloudinaryHelper'
import { ProductType } from '../types'
import { dev } from '../config'

const successResponse = (res: Response, statusCode = 200, message = 'Successful', payload = {}) => {
  res.status(statusCode).send({
    message,
    payload: payload,
  })
}

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //pagination
    let page = Number(req.query.page)
    const limit = Number(req.query.limit)

    //search
    const search = req.query.search as string

    //filter by category
    const categoryFilter = req.query.filter as string

    const { products, count, totalPages, currentPage } = await findAllProducts(
      page,
      limit,
      search,
      categoryFilter
    )

    successResponse(res, 200, 'Return all products', {
      products,
      pagination: {
        totalProducts: count,
        totalPages,
        currentPage,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getSingleProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params
    const product = await Product.findOne({ slug })
    if (!product) {
      throw new ApiError(404, `No product found with this slug ${slug}`)
    }

    successResponse(res, 200, 'Single product is rendered', product)
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, price, description, category, quantity, shipping } = req.body
    let image = req.file && req.file.path

    const productExist = await Product.exists({title})
    if(productExist){
      throw new Error('Product already exist')
    }

    if (image) {
      //newProduct.image = imagePath

      const cloudinaryUrl = await uploadToCloudinary(
        image,
        'Ecommerce-cloudinary/products'
      )
      image = cloudinaryUrl
    }

    const newProduct: ProductInterface = new Product({
      title,
      slug: slugify(title),
      price: Number(price),
      description,
      image,
      category,
      quantity: Number(quantity),
      shipping: shipping && Number(shipping),
    })

    const newProductData = await newProduct.save()

    successResponse(res, 201, 'New product is created', newProductData)
  } catch (error) {
    res.status(400).send('Product can not be created')
    next(error)
  }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const product = await deleteProductById(id)

    successResponse(res, 200, `Product ${id} is deleted`, product)
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id
    const product = await Product.findById(id)
    if (!product) {
      throw new ApiError(404, `No product found with this id ${id}`)
    }

    console.log(product);

    const { title, price, description, category, quantity, shipping } = req.body
    let image = req.file && req.file.path

    console.log(req.body);
    console.log(image);

    if (image) {
      const cloudinaryUrl = await uploadToCloudinary(
        image,
        'Ecommerce-cloudinary/products'
      )
      image = cloudinaryUrl
    }
    console.log(image);

    const updatedProductData: Partial<ProductInterface> = { //ProductType
      // title,
      // price,
      // category,
      // description,
      // quantity,
      // sold,
      // shipping,
      title,
      slug: slugify(title),
      price: price,
      description,
      image,
      category,
      quantity: quantity,
      shipping: shipping && shipping,
    }

    console.log(updatedProductData);
    console.log(updatedProductData.image);

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedProductData, { new: true })
    console.log(updatedProduct);

    if (updatedProduct) {
      successResponse(res, 200, `Product ${id} is updated`, updatedProduct)
    } else {
      throw new ApiError(404, `No product found with this id ${id}`)
    }

    if(product.image){
      const publicId = await valueWithoutExtension(product.image)
      await deleteFromcloudinary(`Ecommerce-cloudinary/products/${publicId}`)
    }
  } catch (error) {
    next(error)
  }
}
