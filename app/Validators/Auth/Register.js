'use strict'

class AuthRegister {
  get rules() {
    return {
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed'
    }
  }

  get messages() {
    return {
      'name.required': 'O Nome é Obrigatório!',
      'surname.required': 'O Sobrenome é Obrigatório!',
      'email.required': 'O E-mail é Obrigatório!',
      'email.email': 'E-mail é Inválido!',
      'email.unique': 'Este E-mail Já Existe!',
      'password.required': 'A Senha é Obrigatória!',
      'password.confirmed': 'As Senhas Não São Iguais!',

    }
  }
}

module.exports = AuthRegister
