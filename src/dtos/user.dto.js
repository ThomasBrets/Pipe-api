/**
 * DTO (Data Transfer Object) para Usuario
 *
 * Filtra datos sensibles antes de enviar al cliente
 * ¿Por qué? No queremos exponer el password hasheado ni el resetToken
 */
export class UserDto {
  constructor(user) {
    this._id = user._id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.cart = user.cart;

    // NO incluimos: password, resetToken, resetTokenExp
  }
}
