import { Document, Schema, model } from 'mongoose'

import { CategoryInterface } from './categorySchema'

export interface ProductInterface extends Document {
  id: string
  title: string
  slug: string
  price: number
  categoryId: CategoryInterface['_id']
  image: string
  description: string
  quantity: number
  sold: number
  shipping: number
  //discounts: DiscountInterface[]
  createdAt?: string
  updatedAt?: string
}

export interface DiscountInterface {
  type: 'percentage' | 'fixed'
  value: number
  start: Date
  end: Date
}

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Product title must be at least 3 characters'],
      maxlength: [50, 'Product title must be at most 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Product description must be at least 3 characters'],
      maxlength: [300, 'Product description must be at most 300 characters'],
    },
    image: {
      type: String,
      default: 'public/images/productsImages/defaultProductImage.png',
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
    },
    sold: {
      type: Number,
      default: 0,
      trim: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    // discounts: [
    //   {
    //     type: { type: String, enum: ['percentage', 'fixed'] },
    //     value: Number,
    //     start: Date,
    //     end: Date,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
)

export const Product = model<ProductInterface>('Product', productSchema)
