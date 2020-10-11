'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON'}
}).as('home')

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
require('./admin')

