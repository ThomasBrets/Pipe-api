import MongoDao from "./mongoDao.js";
import { UserModel } from "./models/user.js";

class UserDao extends MongoDao {
  constructor(model) {
    super(model);
  }

  getUserByEmail = async (email) => {
    try {
      return await this.model.findOne({ email });
    } catch (error) {
        throw new Error(error);
    }
  };

  getUserById = async (id) => {
    try {
        return await this.model.findById(id)
    } catch (error) {
        throw new Error(error);
    }
  }
}

export const userDao = new UserDao(UserModel)
