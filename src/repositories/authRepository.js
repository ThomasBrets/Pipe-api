import { userDao } from "../daos/userDao.js";

class AuthRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getUserByEmail = async (email) => {
    try {
      return await this.dao.getUserByEmail(email);
    } catch (error) {
      throw error;
    }
  };

  create = async (userData) => {
    try {
      return await this.dao.create(userData);
    } catch (error) {
      throw error;
    }
  };
}

export const authRepository = new AuthRepository(userDao); 
