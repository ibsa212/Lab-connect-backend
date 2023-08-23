import { Request, Response, NextFunction } from 'express'
import dataAccessLayer from '../../common/dal'

import Test from './model'
import { CustomError } from '../../middlewares/utils/errorModel'

const testDal = dataAccessLayer(Test)

const getAllTests = (req: Request, res: Response, next: NextFunction) => {
  testDal
    .getMany({})
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const getOneTest = (req: Request, res: Response, next: NextFunction) => {
  const testId = req.params.id
  testDal
    .getOne({ _id: testId })
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const createOneTest = (req: Request, res: Response, next: NextFunction) => {
  const newTest = req.body
  testDal
    .createOne(newTest)
    .then((data: any) => {
      if (!data) {
        throw new CustomError("Couldn't create test", 400)
      }
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const updateOneTest = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id
  const changedProps = req.body
  testDal
    .updateOne(changedProps, userId)
    .then((data) => {
      if (!data) {
        throw new CustomError('Cannot update test', 400)
      }
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const deleteOneTest = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id
  if (req.user._id == userId) {
    testDal
      .deleteOne(userId)
      .then((data) => {
        if (!data) {
          throw new CustomError('Cannot delete test', 400)
        }
        res.status(200).json({ message: 'test deactivated', data })
      })
      .catch((err) => {
        next(err)
      })
  } else {
    throw new CustomError('You are not authorized to delete this test', 401)
  }
}

const testController = {
  getAllTests,
  getOneTest,
  createOneTest,
  updateOneTest,
  deleteOneTest
}

export default testController
