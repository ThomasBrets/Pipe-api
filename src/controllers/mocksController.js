import { mocksService } from "../services/mocksService";

class MocksController {
  constructor(services) {
    this.services = services;
  }

 //USERS
 mocksUsers = async(req, res, next) => {
  try {
    const quantity = req.query.quantity || 50
    const users = await this.services.createMocksUsers(quantity)
    
    res.status(200).json({status: "success", users, quantity})
  } catch (error) {
    next(error)
  }
 }

 generateMocksUsers = async(req, res, next) => {
  try {
    const quantity = req.query.quantity || 100
    const created = await this.services.insertMocksUsers(quantity)

    res.status(201).json({
      status:"success",
      inserted: created.length
    })
  } catch (error) {
    next(error)
  }
 }

//PRODUCTS

mocksProducts = async (req, res, next)=> {
try {
  const quantity = req.query.quantity || 50
  const products = this.services.createMocksProducts(quantity)
  res.status(200).json({
    status:"success",
    quantity,
    products
  })
} catch (error) {
  next(error)
}
}

generateMocksProducts = async (req, res, next)=> {
  try {
    const quantity = req.query.quantity || 100
    const created = this.services.insertMocksProducts(quantity)

    res.status(201).json({
      status: "success",
      inserted: created.length
    })
  } catch (error) {
    next(error)
  }
}
}

export const mocksController = new MocksController(mocksService);
