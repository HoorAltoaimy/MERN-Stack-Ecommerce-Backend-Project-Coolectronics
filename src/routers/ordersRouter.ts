import express, { Router } from 'express'

import {
  deleteOrderById,
  generateBraintreeClientToken,
  getAllOrders,
  getOrderById,
  handleBraintreePayment,
  placeOrder,
  updateOrderById,
} from '../controllers/ordersController'
import { runValidation } from '../validation/runVaildator'
import { validateIdOrder } from '../validation/validator'
import { isLoggedIn } from '../middlewares/authentication'

const router = express.Router()

//GET: /api/orders -> return all orders
router.get('/', getAllOrders)

//POST: /api/orders -> create order
router.post('/', placeOrder)

//GET: /api/orders:orderId -> return detail of single order
router.get('/:orderId', validateIdOrder, runValidation, getOrderById)

//PUT: /api/orders:orderId -> update status info of single order
router.put('/:orderId', validateIdOrder, runValidation, updateOrderById)

//DELETE: /api/orders:orderId -> delete single order by Id
router.delete('/:orderId', validateIdOrder, runValidation, deleteOrderById)

//get the braintree client token
router.get('/braintree/token', isLoggedIn, generateBraintreeClientToken)

router.post('/braintree/payment', isLoggedIn, handleBraintreePayment)

export default router
