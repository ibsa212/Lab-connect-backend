import { Router } from 'express'
import testController from '../tests/controller'

const router = Router()

router
  .route('/')
  .get(testController.getAllTests)
  .post(testController.createOneTest)

router
  .route('/:id')
  .get(testController.getOneTest)
  .put(testController.updateOneTest)
  .delete(testController.deleteOneTest)

export default router
