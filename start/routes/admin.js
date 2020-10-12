'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  /**
   * Rotas de Categorias
   */
  Route.resource('categories', 'CategoryController').apiOnly()
  /**
   * Rotas de Produtos
   */
  Route.resource('products', 'ProductController').apiOnly()
  /**
   * Rotas de Cupons
   */
  Route.resource('coupons', 'CouponController').apiOnly()
  /**
   * Rotas de Pedidos
   */
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController').apiOnly()
  /**
   * Rotas de Imagens
   */
  Route.resource('images', 'ImageController').apiOnly()
  /**
   * Rotas de Usuários
   */
  Route.resource('users', 'UserController').apiOnly()
}).prefix('v1/admin').namespace('Admin').middleware(['auth', 'is:(admin || manager)'])
