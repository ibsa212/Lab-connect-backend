import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import dataAccessLayer from '../../common/dal'
import { CustomError } from '../../middlewares/utils/errorModel'
import LabResult from './model'
import investigativeRequest from '../investigativeRequest/model'
import test from '../tests/model'
import db from '../../services/db'
import { sendSMS } from '../../services/sms-send'

const InvestigativeRequestDAL = dataAccessLayer(investigativeRequest)
const LabResultDAL = dataAccessLayer(LabResult)
const TestDAL = dataAccessLayer(test)

const create = async (req: Request, res: Response, next: NextFunction) => {
  const newLabResult = req.body
  const currentUser = req.user

  if (currentUser.role == 'Lab Technician') {
    const data = await InvestigativeRequestDAL.getOnePopulated({ _id: newLabResult.investigativeRequestId }, 'requestedBy', 'requestedTo', 'patient')

    if (!data || data.testStatus[newLabResult.testId] != 'SAMPLED' || data.status == 'RECEIVED') {
      const errorMessage = !data ? 'Can not create a result for an investigative request that does not exist' : "Only sampled requests can be processed"
      return res.status(404).json(new CustomError(errorMessage, 400))
    }

    const identifier = data.requestedBy.identifier.split('.')
    const IRSenderPhone = identifier[identifier.length - 1]
    const IRSenderName = `${data.requestedBy.firstName} ${data.requestedBy.middleName}`
    const patientName = `${data.patient.firstName} ${data.patient.middleName}`
    const patIdentifier = data.patient.identifier.split('.')
    const patientPhone = patIdentifier[patIdentifier.length - 1]
    const labName = data.requestedTo.facilityName

    const testData = await TestDAL.getOne({ _id: newLabResult.testId })

    let errorMessage;
    if (!testData)
      errorMessage = 'Can not create a result for a test that does not exist'
    else if (testData.resultType == 'Range' && newLabResult.value == null)
      errorMessage = 'Bad Request, value must not be null for this specific test type'
    else if (testData.resultType == 'Binary' && newLabResult.positive == null)
      errorMessage = 'Bad Request, positive must not be null for this specific test type'

    if (errorMessage) return res.status(400).json(new CustomError(errorMessage, 400))

    const session = await db.Connection.startSession()
    try {
      session.startTransaction()

      const result = await LabResultDAL.createWithTransaction(newLabResult, session)
      const investigativeRequestId = newLabResult.investigativeRequestId
      const IRData = await InvestigativeRequestDAL.getOne({ _id: investigativeRequestId })
      IRData.testStatus[String(newLabResult.testId)] = "RECEIVED"

      let receivedTests = 0
      for (const test in IRData.testStatus) {
        if (IRData.testStatus[String(test)] == 'RECEIVED')
          receivedTests = receivedTests + 1
      }

      const changedProps = { testStatus: IRData.testStatus }
      if (receivedTests == IRData.requestedTests.length)
        changedProps['status'] = 'RECEIVED'

      const IR = await InvestigativeRequestDAL.updateWithTransaction(
        changedProps,
        investigativeRequestId,
        session
      )

      const docMessage = `Dear ${IRSenderName}, the report for investigative request of ${patientName} has arrived. Please check the results at https://laboratory-system.vercel.app/auth/login        Lab Connect`
      const patMessage = `Dear ${patientName}, the report for your requested investigative request has arrived. Please Consult your doctor ${IRSenderName} for the results.       Lab Connect`

      if (receivedTests == IRData.requestedTests.length) {
        const smsResponse = sendSMS(IRSenderPhone, docMessage)
        const smsResponse2 = sendSMS(patientPhone, patMessage)
      }


      await session.commitTransaction()
      session.endSession()
      return res.status(200).json(result)
    }
    catch {
      session.abortTransaction()
      return res.status(400).json({ message: 'Task failed' })
    }
  } else {
    return res.status(401).json(new CustomError('Unauthorized to create a result', 401, {}))
  }
}

const getLabResult = (req: Request, res: Response, next: NextFunction) => {
  const labResultId = req.params.id
  const currentUser = req.user
  if (currentUser.role != 'Lab Technician') {
    LabResultDAL.getAllPopulated({ _id: labResultId })
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  }
}

const getLabResultByInvestigativeRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser = req.user
  const investigativeRequestId = req.params.id
  const pipeline = [
    {
      $match: {
        investigativeRequestId: new ObjectId(investigativeRequestId)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'filledBy',
        foreignField: '_id',
        as: 'filledBy'
      }
    },
    {
      $unwind: {
        path: '$filledBy',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'tests',
        localField: 'testId',
        foreignField: '_id',
        as: 'test'
      }
    },
    {
      $unwind: {
        path: '$test',
        preserveNullAndEmptyArrays: true
      }
    }
  ]

  LabResultDAL.aggregatedQuery(pipeline)
    .then(async (data: any) => {
      if (currentUser.role == 'Lab Technician' || currentUser.role == 'Doctor')
        return res.status(200).json(data)
      else {
        const IR = await InvestigativeRequestDAL.getOne({ _id: investigativeRequestId })
        if (String(IR.requestedBy) == String(IR.patient))
          return res.status(200).json(data)
      }

      return res.status(401).json(new CustomError('Not Authorized', 401))

    })
    .catch((err) => {
      next(err)
    })
}

const getAllLabResult = (req: Request, res: Response, next: NextFunction) => {
  const currentUser = req.user
  const populationFilter = {
    path: 'investigativeRequestId',
    match: { requestedBy: { $eq: currentUser._id } }
  }
  const populationFilterTest = {
    path: 'testId'
  }
  const populationFilterFilledBy = {
    path: 'filledBy',
    select: 'email'
  }

  if (currentUser.role == 'Lab Technician') {
    LabResultDAL.getAllPopulated(
      { filledBy: currentUser._id },
      populationFilter,
      populationFilterTest,
      populationFilterFilledBy
    )
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  } else if (currentUser.role == 'Doctor') {
    LabResultDAL.getAllPopulated(
      {},
      populationFilter,
      populationFilterTest,
      populationFilterFilledBy
    )
      .then((data: any) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  } else {
    throw new CustomError('Not Authorized to fetch results', 401, {})
  }
}

export default {
  create,
  getLabResult,
  getAllLabResult,
  getLabResultByInvestigativeRequest
}
