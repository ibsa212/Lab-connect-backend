import { NextFunction, Request, Response } from 'express'
import { isObjectIdOrHexString } from 'mongoose'
import { ObjectId } from 'mongodb'

import dataAccessLayer from '../../common/dal'
import { CustomError } from '../../middlewares/utils/errorModel'
import FacilityTests from './model'

const FacilityTestsDAL = dataAccessLayer(FacilityTests)

const create = (req: Request, res: Response, next: NextFunction) => {
  const newFacilityTest = req.body
  FacilityTestsDAL.createOne(newFacilityTest)
    .then((data) => {
      if (!data) {
        throw new CustomError(
          'Cannot create new facility test, try again in a few minutes',
          404,
          data.message
        )
      }
      res.status(201).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const getFacilityTests = (req: Request, res: Response, next: NextFunction) => {
  const facilityId = req.params.id

  const pipeline =
    [
      {
        '$match': {
          'facilityId': new ObjectId(facilityId)
        }
      }, {
        '$lookup': {
          'from': 'tests',
          'localField': 'testId',
          'foreignField': '_id',
          'as': 'tests'
        }
      }, {
        '$unwind': {
          'path': '$tests',
          'preserveNullAndEmptyArrays': true
        }
      }
    ]

  if (ObjectId.isValid(facilityId)) {
    FacilityTestsDAL.aggregatedQuery(pipeline)
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  } else {
    return res.status(400).json((new CustomError('Bad Request', 400)))
  }
}

const getAvailableFacilityTests = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const testIds = req.body.tests
  let testObjIds = []

  testIds.forEach((element, index) => {
    if (ObjectId.isValid(element)) {
      testObjIds[index] = new ObjectId(element)
    } else {
      throw new CustomError('Bad request', 400)
    }
  })
  let pipeline = []
  if (testIds.length == 0) {
    pipeline = [
      {
        '$group': {
          '_id': '$facilityId',
          'tests': {
            '$push': {
              'id': '$testId'
            }
          }
        }
      }, {
        '$lookup': {
          'from': 'tests',
          'localField': 'tests.id',
          'foreignField': '_id',
          'as': 'tests'
        }
      }, {
        '$lookup': {
          'from': 'facilities',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'facility'
        }
      }, {
        '$unwind': {
          'path': '$facility',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$lookup': {
          'from': 'addresses',
          'localField': 'facility.address',
          'foreignField': '_id',
          'as': 'facility.address'
        }
      }, {
        '$unwind': {
          'path': '$facility.address',
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$sort': {
          'availableCount': 1
        }
      }
    ]
  } else {
    pipeline = [
      {
        $match: {
          testId: {
            $in: testObjIds
          }
        }
      },
      {
        $group: {
          _id: '$facilityId',
          tests: {
            $push: {
              id: '$testId'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'tests',
          localField: 'tests.id',
          foreignField: '_id',
          as: 'tests'
        }
      },
      {
        $lookup: {
          from: 'facilities',
          localField: '_id',
          foreignField: '_id',
          as: 'facility'
        }
      },
      {
        $unwind: {
          path: '$facility',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'facility.address',
          foreignField: '_id',
          as: 'facility.address'
        }
      },
      {
        $unwind: {
          path: '$facility.address',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          availableCount: 1
        }
      }
    ]
  }
  FacilityTestsDAL.aggregatedQuery(pipeline)
    .then((data: any) => {
      if (!data) {
        throw new CustomError('Tests not available', 404)
      }
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const getAllFacilityTests = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  FacilityTestsDAL.getMany({})
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const updateFacilityTest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const facilityId = req.params.id
  const changedProps = req.body
  if (ObjectId.isValid(facilityId)) {
    FacilityTestsDAL.updateOne(changedProps, facilityId)
      .then((data) => {
        if (!data) {
          throw new CustomError('Cannot update facility test', 404)
        }
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  } else {
    return res.status(400).json(new CustomError('Bad Request', 400))
  }
}

const deleteFacilityTest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const facilityId = req.params.id
  if (req.user.institution == facilityId) {
    FacilityTestsDAL.deleteOne(facilityId)
      .then((data) => {
        if (!data) {
          throw new CustomError('Cannot delete facility test', 400)
        }
        res.status(200).json({ message: 'facility test deleted', data })
      })
      .catch((err) => {
        next(err)
      })
  } else {
    return res
      .status(401)
      .json(
        new CustomError(
          'You are not authorized to delete this facility test',
          401
        )
      )
  }
}

const oneSelfTest = (req: Request, res: Response, next: NextFunction) => {
  const facilityId = req.params.id
  FacilityTestsDAL.getAllPopulated({
    facilityId: facilityId,
    selfRequest: true
  }, 'testId', 'facilityId')
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const selfTests = (req: Request, res: Response, next: NextFunction) => {
  FacilityTestsDAL.getAllPopulated({ selfRequest: true }, 'testId', 'facilityId')
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

export default {
  create,
  getFacilityTests,
  getAllFacilityTests,
  updateFacilityTest,
  deleteFacilityTest,
  oneSelfTest,
  getAvailableFacilityTests,
  selfTests
}
