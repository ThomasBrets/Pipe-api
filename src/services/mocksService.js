import { mocksRepository } from "../repositories/mocksRepository";
import { generateUsers } from "../utils/generateUsers.mocks";
import { generateProduct } from "../utils/generateProducts.mocks";

class MocksService {
  constructor(repository) {
    this.repository = repository;
  }
  // USERS
  generateMocksUsers = async (quantity) => {
    const users = Array.from({ length: quantity }, () => generateUsers());
    return users
  };

  insertMocksUsers = async (quantity) => {
    const users = await this.generateMocksUsers(quantity);
    return await this.repository.insertUsers(users);
  };

  // PRODUCTS
  generateMocksProducts = async (quantity)=> {
    const products = Array.from({length:quantity}, ()=> generateProduct())
    return products
  }

  insertMocksProducts = async (quantity) => {
    const products = await this.generateMocksProducts(quantity)
    return await this.repository.insertProducts(products)
  }
}

export const mocksService = new MocksService(mocksRepository);
