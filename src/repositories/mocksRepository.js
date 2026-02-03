import { mocksDao } from "../daos/mocksDao.js"

class MocksRepository {
    constructor(dao){
        this.dao = dao
    }
insertUsers = async(users) =>{
    return await this.dao.insertManyUsers(users)
}

insertProducts = async (products) => {
    return await this.dao.insertManyProducts(products)
}
}

export const mocksRepository = new MocksRepository(mocksDao)