'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/**
 * Retorna o usuário logado atualmente
 */
Route.get('v1/me', 'UserController.me')
  .as('me')
  .middleware('auth')

/**
 * Importa as rotas de Auth
 */
 require('./auth')

 /**
 * Importa as rotas de Admin
 */
 require('./admin')

 /**
 * Importa as rotas de Client
 */
require('./client')

