import { ProductModel } from "./models/product";
import { UserModel } from "./models/user";
import MongoDao from "./mongoDao";

class MocksDao extends MongoDao {
  insertManyUsers = async (users) => {
    return await UserModel.insertMany(users);
  };

  insertManyProducts = async (products) => {
    return await ProductModel.insertMany(products);
  };
}
export const mocksDao = new MocksDao();
