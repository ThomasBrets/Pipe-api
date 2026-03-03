import { cartRepository } from "../repositories/cartRepository.js";
import CustomError from "../utils/custom-error.js";
import { sendPurchaseEmailService } from "./email-services.js";

class CartService {
  constructor(repository) {
    this.repository = repository;
  }
  getCart = async (cid) => {
    const cart = await this.repository.getCartById(cid);
    if (!cart) throw new CustomError("Carrito no encontrado", 404);
    return cart;
  };

  createCart = async () => {
    const cart = await this.repository.createCart();
    console.log("SERVICERCART", cart);
    return cart;
  };

  addProduct = async (cid, pid, quantity) => {
    const cart = await this.getCart(cid);
    const productInCart = cart.products.find((item) =>
      item.product.equals(pid)
    ); //ver si el producto ya está en el carrito (equals => compara el verdadero valor de objectID())

    if (productInCart) {
      productInCart.quantity += parseInt(quantity); // si ya está, sumo cantidad
    } else {
      cart.products.push({ product: pid, quantity: parseInt(quantity) }); // si no está, lo agrego al array
    }

    await this.repository.saveCart(cart); // guardo los cambios en la DB
    return cart; //Devolvemos el carrito actualizado
  };

  updateProductQuantity = async (cid, pid, quantity) => {
    const cart = await this.getCart(cid);
    const productInCart = cart.products.find((item) =>
      item.product.equals(pid)
    );
    if (!productInCart)
      throw new CustomError("Producto no encontrado en el carrito", 404);

    productInCart.quantity = quantity;
    await this.repository.saveCart(cart);
    return cart;
  };

  removeProduct = async (cid, pid) => {
    const cart = await this.getCart(cid);
    // Filtro todos los productos cuyo ID **no sea igual** al que queremos eliminar
    cart.products = cart.products.filter((item) => !item.product.equals(pid));
    await this.repository.saveCart(cart);
    return cart;
  };

  replaceProducts = async (cid, products) => {
    const cart = await this.getCart(cid);
    cart.products = products;
    await this.repository.saveCart(cart);
    return cart;
  };

  clearCart = async (cid) => {
    const cart = await this.getCart(cid);
    cart.products = [];
    await this.repository.saveCart(cart);
    return cart;
  };

  purchaseCart = async (cid, user) => {
    const cart = await this.getCart(cid);

    if (!cart.products || cart.products.length === 0) {
      throw new CustomError("El carrito esta vacío", 400);
    }
    let total = 0;
    //Resumen de cada product
    const items = cart.products.map((item) => {
      const price = Number(item.product.price || 0);
      const qty = Number(item.quantity || 0);
      const subtotal = price * qty;
      total += subtotal;
      return { title: item.product.title, price, quantity: qty, subtotal };
    });

    // 🧹 Vaciar carrito después de la compra (ANTES del email para no bloquear)
    cart.products = [];
    await this.repository.saveCart(cart);

    // 🧾 Enviar email con resumen (no-bloqueante: si falla, la compra ya se completó)
    try {
      await sendPurchaseEmailService(user, items, total);
    } catch (emailError) {
      console.error("⚠️ Email de compra falló, pero la compra se completó:", emailError.message);
    }

    return {
      message: "Compra realizada con éxito.",
      total,
    };
  };
}

export const cartService = new CartService(cartRepository);
