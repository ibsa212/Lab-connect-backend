import { NextFunction, Request, Response } from 'express'
import dataAccessLayer from '../../common/dal'
import Sample from './model'
import InvestigativeRequest from '../investigativeRequest/model'
import Test from '../tests/model'
import { CustomError } from '../../middlewares/utils/errorModel'
import db from '../../services/db'
import { ObjectId } from 'mongodb'

const InvestigativeRequestDAL = dataAccessLayer(InvestigativeRequest)
const SampleDAL = dataAccessLayer(Sample)
const TestDal = dataAccessLayer(Test)

const create = async (req: Request, res: Response, next: NextFunction) => {
  const newSample = req.body
  const currentUser = req.user

  const doubleSampled = await SampleDAL.getOne({
    investigativeRequestId: newSample.investigativeRequestId,
    sampleType: newSample.sampleType
  })

  if (doubleSampled) {
    res.status(400).send('The sample is already taken')
  }
  else {
    if (currentUser.role === 'Lab Technician') {

      const session = await db.Connection.startSession()
      try {

        session.startTransaction()

        const createdSample = await SampleDAL.createWithTransaction(newSample, session)

        const IR = await InvestigativeRequestDAL.getOne({ _id: newSample.investigativeRequestId })
        for (const testId of IR.requestedTests) {
          const testData = await TestDal.getOne({ _id: testId })

          if (testData.testType == newSample.sampleType)
            IR.testStatus[testId] = "SAMPLED"
        }

        // const changedProps = { status: "SAMPLED" }
        const investigativeRequestId = newSample.investigativeRequestId

        await InvestigativeRequestDAL.updateWithTransaction({ testStatus: IR.testStatus },
          investigativeRequestId,
          session)
        await session.commitTransaction()
        session.endSession()
        return res.status(200).json(createdSample)

      }
      catch {
        session.abortTransaction()
        return res.status(400).json({ message: 'Task failed' })
      }

    }
    else {
      throw new CustomError('Unauthorized to create a Sample', 401, {})
    }

  }

}
const getSamplesOfThisFacility =  (req: Request, res: Response, next: NextFunction) => {
    const userInstitution = req.user.institution
    const pipeline = [
      {
        '$lookup': {
          'from': 'investigativerequests', 
          'localField': 'investigativeRequestId', 
          'foreignField': '_id', 
          'as': 'inv'
        }
      }, {
        '$unwind': {
          'path': '$inv', 
          'preserveNullAndEmptyArrays': true
        }
      }, {
        '$match': {
          'inv.requestedTo': new ObjectId(userInstitution )
        }
      }
    ]
    if (req.user.role === 'Lab Technician') {
    SampleDAL.aggregatedQuery(pipeline)
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
    }
    else {
      res.status(401).json({ message: "Not Authorized" })
    }


}

const getSamples = (req: Request, res: Response, next: NextFunction) => {
  const currentUser = req.user
  if (currentUser.role === 'Lab Technician') {
    SampleDAL.getAllPopulated({}, 'investigativeRequestId')
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  }
  else {
    res.status(401).json({ message: "Not Authorized" })
  }
}

const getKitpopluated = (req: Request, res: Response, next: NextFunction) => {
  const kitNumber = req.params.number
  const currentUser = req.user
  if (currentUser.role === 'Lab Technician') {
    SampleDAL.getAllPopulated({ kitNumber: kitNumber }, 'investigativeRequestId')
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  }
  else {
    res.status(401).json({ message: "Not Authorized" })
  }
}


const getIRpopulated = (req: Request, res: Response, next: NextFunction) => {
  const investigativeRequestId = req.params.id
  const currentUser = req.user
  if (currentUser.role === 'Lab Technician') {
    SampleDAL.getAllPopulated({ investigativeRequestId: investigativeRequestId }, 'investigativeRequestId')
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  }
  else {
    res.status(401).json({ message: "Not Authorized" })
  }
}

const getSampleTypepopluated = (req: Request, res: Response, next: NextFunction) => {
  const sampleType = req.params.type
  const currentUser = req.user
  if (currentUser.role === 'Lab Technician') {
    SampleDAL.getAllPopulated({ sampleType: sampleType }, 'investigativeRequestId')
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  }
  else {
    res.status(401).json({ message: "Not Authorized" })
  }
}

const getSampleIdpopulated = (req: Request, res: Response, next: NextFunction) => {
  const sampleId = req.params.id
  const currentUser = req.user
  if (currentUser.role === 'Lab Technician') {
    console.log(currentUser.role, sampleId)
    SampleDAL.getAllPopulated({ _id: sampleId }, 'investigativeRequestId')
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  }
  else {
    res.status(401).json({ message: "Not Authorized" })
  }
}
export default {
  create,
  getSamples,
  getKitpopluated,
  getIRpopulated,
  getSampleTypepopluated,
  getSampleIdpopulated,
  getSamplesOfThisFacility
}
