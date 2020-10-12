'use strict'

const Pagination = require('../../../Middleware/Pagination')
const Discount = require('../../../Models/Discount')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order')
const Database = use('Database')
const Service = use('App/Services/Order/OrderService')

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async index ({ request, response, pagination }) {
    const { status, id } = request.input(['status, id'])
    const query = Order.query()

    if(status && id) {
      query.where('status', status)
      query.orWhere('id', 'LIKE', `%${id}%`)
    } else if (status) {
      query.where('status', status)
    } else if (id) {
      query.orWhere('id', 'LIKE', `%${id}%`)
    }

    const orders = await query.paginate(
      pagination.page,
      pagination.limit
    )
    return response.send(orders)
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      let order = await Order.create({ user_id, status }, trx)
      const service = new Service(order, trx)

      if(items && items.length > 0) {
        await service.syncItems(items)
      }

      await trx.commit()
      return response.status(201).send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Não Foi Possível Criar o Pedido!'})
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params: { id }, response }) {
    const order = await Order.findOrFail(id)
    return response.send(order)
  }


  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id)
    const trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })
      const service = new Service(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      return response.status(200).send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Não Foi Possível Atualizar o Pedido!'})
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, request, response }) {
    const order = await Order.findOrFail(id)
    const trx = await Database.beginTransaction()
    try {
      await order.items().delete(trx)
      await order.coupons().delete(trx)
      await order.delete(trx)
      await trx.commit()
      return response.status(204).send()
    } catch {
      await trx.rollback()
      return response.status(400).send({ message: 'Não Foi Possível Remover o Pedido!'})
    }
  }

  async applyDiscount ({ params: { id }, request, response }) {
    const { code } = request.all()
    const coupon = await coupon.findByOrFail('code', code.toUpperCase())
    const order = await Order.findOrFail(id)
    var discount,
      info = {}
      try {
        const service = new Service(order)
        const canAddDiscount = await service.canApplyDiscount(coupon)
        const orderDiscounts = await order.coupons().getCount()

        const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive)
        if(canAddDiscount && canApplyToOrder) {
          discount = await Discount.findOrCreate({
            order_id: order.id,
            coupon_id: coupon.id
          })
          info.message = 'Cupom Aplicado Com Sucesso!'
          info.success = true
        } else {
          info.message = 'Não Foi Possível Aplicar Este Cupom!'
          info.success = false
        }

        return response.send({ order, info })
      } catch (error) {
        return response.status(400).send({ message: 'Erro ao Aplicar o Cupom!'})
      }
  }

  async removeDiscount ({ params: { id }, request, response }) {
    const { discount_id } =request.all()
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send()
  }
}

module.exports = OrderController
