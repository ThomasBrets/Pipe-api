import { hash, compare } from "bcrypt";

export const createHash = async (password) => {
  return await hash(password, 10);
};

export const isValid = async (passwordPlain, passwordHash) => {
  return await compare(passwordPlain, passwordHash);
};