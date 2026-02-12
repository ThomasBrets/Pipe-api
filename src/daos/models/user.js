import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // Validación de formato de email con regex
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Por favor ingrese un email válido",
    ],
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    type: Schema.Types.ObjectId,
    ref: "Cart",
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  //?Campos para recuperar contraseña
  resetToken: { type: String, default: null },
  resetTokenExp: { type: Number, default: null },
});

export const UserModel = model("User", UserSchema);
