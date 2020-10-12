'use strict'

const { Database } = require("sqlite3")

class OrderService {
  constructor(model, trx = false) {
    this.model = model
    this.trx = trx
  }

  async syncItems(items) {
    if (!Array.isArray(items)){
      return false
    }

    await this.model.items().delete(this.trx)
    await this.model.items().createMany(items, this.trx)
  }

  async updateItems(items) {
    let currentItems = await this.model
      .items()
      .whereIn('id', items.map(item => item.id))
      .fetch()

      await this.model
        .items()
        .whereNotIn('id', items.map(item => item.id))
        .delete(this.trx)

        await Promise.all(currentItems.rows.map(async item => {
          item.fill(items.find(n => n.id === item.id))
          await item.save(this.trx)
        }))
  }

  async canApplyDiscount(coupon) {
    const now = new Date().getTime()
    if(now > coupon.valid_from.getTime() ||(typeof coupon.valid_until == 'object' && coupon.valid_until.getTime() < now)) {
      // Verifica se o cupom já entrou em validade
      // Verifica se há uma data de expiração
      // Se houver data de expiração, verifica se o cupom expirou
      return false
    }

    const couponProducts = await Database.from('coupon_products')
      .where('coupon_id', coupon.id)
      .pluck('product_id')

    const couponClients = await Database.from('coupon_user')
      .where('coupon_id', coupon.id)
      .pluck('user_id')

    if(
      Array.isArray(couponProducts) &&
      couponProducts.length < 1 &&
      Array.isArray(couponClients) &&
      couponClients < 1
    ) {
      return true
    }

    let isAssociatedToProducts, isAssociatedToClients = false

    if(Array.isArray(couponProducts) && couponProducts.length > 0){
      isAssociatedToProducts = true
    }

    if(Array.isArray(couponClients) && couponClients.length > 0){
      isAssociatedToClients = true
    }

    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProducts)
      .pluck('product_id')

    //Cupom associado a clientes e a produtos
    if(isAssociatedToClients && isAssociatedToProducts) {
      const clientMatch = couponClients.find(
        client => client === this.model.user_id
      )

      if(clientMatch && Array.isArray(productsMatch) && productsMatch.length > 0) {
        return true
      }
    }

    //Cupom associado apenas a produtos
    if(
      isAssociatedToProducts &&
      Array.isArray(productsMatch) &&
      productsMatch.length > 0
    ) {
      return true
    }

    //Cupom associado apenas a clientes
    if(
      isAssociatedToClients &&
      Array.isArray(couponClients) &&
      couponClients.length > 0
    ) {
      const match = couponClients.find(client => client === this.model.user_id)
      if(match) {
        return true
      }
    }

    //Cupom não disponível para uso
    return false
  }
}

module.exports = CouponService
