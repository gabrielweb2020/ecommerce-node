'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

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

