import { NextFunction, Request, Response } from 'express'
import dataAccessLayer from '../../../common/dal'
import { CustomError } from '../../../middlewares/utils/errorModel'
import investigativeRequest from '../../investigativeRequest/model'
import facilityTests from '../../facility-tests/model'
import labresults from '../../labResults/model'
import {
    ObjectId
  } from 'mongodb';
import { pipeline } from 'stream'
  

const InvestigativeRequestDAL = dataAccessLayer(investigativeRequest)
const FacilityTestsDAL = dataAccessLayer(facilityTests)
const ResultsDAL = dataAccessLayer(labresults)



const getMyInvestigativeRequests = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {    
    const filter = { patient: req.user._id }
    
    InvestigativeRequestDAL.getAllPopulated(
      filter,
      'requestedBy',
      'requestedTo',
      'patient',
      'requestedTests'
    )
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  }
  

  
const getFacilityTests = (req: Request, res: Response, next: NextFunction) => {
  const facilityId = req.params.id

const pipeline = [
  {
    '$match': {
      'facilityId': new ObjectId(facilityId), 
      'selfRequest': true
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

  FacilityTestsDAL.aggregatedQuery(pipeline)
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}


  
const getTests = (req: Request, res: Response, next: NextFunction) => {
    const testIds = req.body.tests
    let testObjIds = []
  
  testIds.forEach((element, index) => {
    testObjIds[index] = new ObjectId(element)
  
  });
  const pipeline = [
    {
      '$match': {
        'testId': {
          '$in': testObjIds
        }, 
        'selfRequest': true
      }
    }, {
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
        'availableCount': -1
      }
    }
  ]
    FacilityTestsDAL.aggregatedQuery(pipeline)
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  }
  
  
const getSelfOrderTests = (req: Request, res: Response, next: NextFunction) => {
  
const pipeline = [
  {
    '$match': {
      'selfRequest': true
    }
  }, {
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
  }
]
  FacilityTestsDAL.aggregatedQuery(pipeline)
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}


const getFacilitySelfOrderTests = (req: Request, res: Response, next: NextFunction) => {
  const facilityId = req.params.id
 
const pipeline = [
  {
    '$match': {
      'facilityId': new ObjectId(facilityId), 
      'selfRequest': true
    }
  }, {
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
  }
]
  FacilityTestsDAL.aggregatedQuery(pipeline)
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}


  
  const getMyResults = (req: Request, res: Response, next: NextFunction) => {
    const currentUser = req.user
    const populationFilter = {
      path: 'investigativeRequestId',
      match: { patient: { $eq: currentUser._id } }
    }
    const populationFilterTest = {
      path: 'testId'
    }
    const populationFilterFilledBy = {
      path: 'filledBy',
      select: 'email'
    }
  
      ResultsDAL.getAllPopulated(
        {},
        populationFilter,
        populationFilterTest,
        populationFilterFilledBy
      )
        .then((data: any) => {
          if (data.length == 0) {
            throw new CustomError('No results found', 404, data)
          }
          res.status(200).json(data)
        })
        .catch((err) => {
          next(err)
        })
  }

  export default {
    getMyInvestigativeRequests,
    getTests,
    getFacilityTests,
    getMyResults,
    getSelfOrderTests
  }