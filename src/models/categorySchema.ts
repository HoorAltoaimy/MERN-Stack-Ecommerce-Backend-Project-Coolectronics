import { Schema, model, Document } from 'mongoose'

export interface CategoryInterface extends Document {
  _id: string
  title: string
  slug: string
  createdAt?: string
  updatedAt: string
  __v: number
}

export const categorySchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      minlength: [3, 'Category title must be at least 3 caracters'],
      maxlength: [50, 'Category title must be at most 50 caracters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true }
)
export const Category = model<CategoryInterface>('Category', categorySchema)
