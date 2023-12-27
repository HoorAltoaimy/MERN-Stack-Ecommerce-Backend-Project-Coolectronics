import { Document, Schema, model } from 'mongoose'

import { ProductInterface } from './productSchema'
import { UserInterface } from './userSchema'

export interface OrederProductInterface {
  products: ProductInterface['_id']
  quantity: number
}

interface OrderPaymentInterface {}

export interface OrderInterface extends Document {
  products: [
    {
      type: Schema.Types.ObjectId
      ref: 'Product'
      required: true
    }
  ]
  payment: OrderPaymentInterface
  buyer: UserInterface['_id']
  status: 'Under Processing' | 'Shipped' | 'Delivered' | 'Canceled'
}

const orderSchema = new Schema<OrderInterface>(
  {
    products: [{ type: Schema.Types.ObjectId, ref: 'Product', required: true }],
    payment: { type: Object, required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Under Processing', 'Shipped', 'Delivered', 'Canceled'],
      default: 'Under Processing',
    },
  },
  { timestamps: true }
)

export const Order = model<OrderInterface>('Order', orderSchema)
