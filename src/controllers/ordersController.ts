import { NextFunction, Request, Response } from 'express'

import {Order} from '../models/orderSchema'
import { Product } from '../models/productSchema'
import { dev } from '../config'
import ApiError from '../errors/ApiError'

const braintree = require('braintree')

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: dev.app.braintreeMerchantId,
  publicKey: dev.app.braintreePublicKey,
  privateKey: dev.app.braintreePrivateKey,
})

export const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, user, products } = req.body
    let totalPriceOfItems = 0
    for (let item = 0; item < products.length; item++) {
      const { product, quantity } = products[item]

      const productInfo = await Product.findById(product)

      // Check if the product exists
      if (!productInfo) {
        return res.status(404).send({ message: `Product of id ${product} not found.` })
      }

      // Check if there is enough stock
      if (productInfo.quantity < quantity) {
        return res
          .status(400)
          .send({ message: 'Not enough stock available for this product.', product })
      }
      totalPriceOfItems += productInfo.price
    }

    // Create a new order
    const order = new Order({
      status,
      user,
      products: products,
      totalPriceOfOrder: totalPriceOfItems,
    })

    // Update product stock (quantity)
    products.map(async (item: typeof products) => {
      const { product, quantity } = item
      const productInfo = await Product.findById(product)
      if (productInfo) {
        const valuofUpdateQuantity = (productInfo.quantity -= quantity)
        const updateQuantity = await Product.findOneAndUpdate(
          { _id: product },
          { quantity: valuofUpdateQuantity },
          { new: true }
        )
        if (updateQuantity) {
          await updateQuantity.save()
        }
      }
    })

    await order.save()
    res.status(201).send({ message: 'Order placed successfully.', order })
  } catch (error) {
    next(error)
  }
}

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().populate('products.product')
    if (!orders) {
      return res.status(404).send({ message: 'list of Orders not found' })
    }
    res.status(201).json(orders)
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.find({ _id: req.params.orderId }).populate('products.product')
    res.status(201).send({ message: 'returned single order', payload: order })
  } catch (error) {
    next(error)
  }
}
export const deleteOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findOneAndDelete({ _id: req.params.orderId })
    res.status(201).send({ message: 'deleted a single order', payload: order })
  } catch (error) {
    next(error)
  }
}

export const updateOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findOneAndUpdate({ _id: req.params.orderId }, req.body, { new: true })
    if (!order) {
      throw new Error('Order not found with this ID')
    }
    res.send({ message: 'update a single product ', payload: order })
  } catch (error) {
    next(error)
  }
}

export const generateBraintreeClientToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const braintreeClientToken = await gateway.clientToken.generate({})
    if (!braintreeClientToken) {
      throw new ApiError(400, 'braintree token was not generated')
    }

    res
      .status(200)
      .send({ message: 'braintree token generated successfully', payload: braintreeClientToken })
  } catch (error) {
    next(error)
  }
}

export interface CustomRequest extends Request {
  userId?: string
}

export const handleBraintreePayment = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const { nonce, cartItems, amount } = req.body

    const result = await gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    })
    
    if (result.success) {
      console.log('Transaction ID: ' + result.transaction.id)
      const order = new Order({
        products: cartItems,
        payment: result,
        buyer: req.userId
      })
      await order.save()


    } else {
      console.error(result.message)
    }

    res.status(201).send({ message: 'Order placed successfully' })
  } catch (error) {
    next(error)
  }
}
