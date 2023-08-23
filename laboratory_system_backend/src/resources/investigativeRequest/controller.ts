import { NextFunction, Request, Response } from 'express'
import dataAccessLayer from '../../common/dal'
import InvestigativeRequest from './model'
import { streamUpload } from '../../services/bucket'
import { CustomError } from '../../middlewares/utils/errorModel'
import { ObjectId } from 'mongodb'

const InvestigativeRequestDAL = dataAccessLayer(InvestigativeRequest)

const create = async (req: Request, res: Response, next: NextFunction) => {
  const role = req.user.role
  if (role === 'Doctor') {
    const testStatus = {}
    for (const testId of req.body.requestedTests) {
      testStatus[testId] = 'REQUESTED'
    }

    const newInvestigativeRequest = {
      requestedBy: req.user._id,
      requestedTo: req.body.requestedTo,
      requestedTests: req.body.requestedTests,
      patient: req.body.patient,
      testStatus: testStatus
    }

    InvestigativeRequestDAL.createOne(newInvestigativeRequest)
      .then((data: any) => {
        if (!data) {
          res
            .status(400)
            .json(new CustomError('Cannot create Investigative Request', 400))
        }
        res.status(201).json(data)
      })
      .catch((err) => {
        next(err)
      })
  } else {
    res.status(401).json({ message: 'User should be a Doctor' })
  }
}

const getAllInvestigativeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const role = req.user.role
  let filter = {}
  if (role === 'Doctor') {
    filter = { requestedBy: req.user._id }
  } else if (role === 'Lab Technician') {
    filter = { requestedTo: req.user.institution }
  } else {
    filter = { patient: req.user._id }
  }
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

const getInvestigativeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const investigativeRequestId = req.params.id
  let filter = {}
  const role = req.user.role
  if (role === 'Doctor') {
    filter = { requestedBy: req.user._id }
  } else if (role === 'Lab Technician') {
    filter = { requestedTo: req.user.institution }
  } else {
    filter = { patient: req.user._id }
  }
  InvestigativeRequestDAL.getOnePopulated(
    { _id: investigativeRequestId, filter },
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

const updateInvestigativeRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const investigativeRequestId = req.params.id
  const changedProps = req.body
  const role = req.user.role
  if (role !== 'Patient') {
    let filter = {}
    if (role === 'Doctor') {
      filter = { requestedBy: req.user._id }
    } else if (role === 'Lab Technician') {
      filter = { requestedTo: req.user.institution }
    }
    let IR = null
    if (ObjectId.isValid(investigativeRequestId)) {
      IR = await InvestigativeRequestDAL.getOne({
        _id: investigativeRequestId,
        filter
      })
    } else {
      return res.status(400).json(new CustomError('Bad Request', 400))
    }

    if (IR) {
      InvestigativeRequestDAL.updateOne(changedProps, investigativeRequestId)
        .then((data) => {
          if (!data)
            res
              .status(400)
              .json(new CustomError('Cannot update Investigative Request', 400))

          res.status(200).json(data)
        })
        .catch((err) => {
          next(err)
        })
    } else {
      res.status(404).json({ message: 'Investigative Request not Found' })
    }
  } else {
    res
      .status(401)
      .json({ message: 'Patient is not allowed to alter Information' })
  }
}

const sampledStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const investigativeRequestId = req.params.id
  const changedProps = { status: 'SAMPLED' }
  const role = req.user.role
  if (role === 'Lab Technician') {
    // let filter = {requestedTo: req.user.institution} //TODO: add filter to check if lab tech belongs to same institution.

    const IR = await InvestigativeRequestDAL.getOne({
      _id: investigativeRequestId
    })

    if (IR) {
      InvestigativeRequestDAL.updateOne(changedProps, investigativeRequestId)
        .then((data) => {
          if (!data)
            return res
              .status(400)
              .json(new CustomError('Cannot update Status', 400))

          res.status(200).json({ message: 'success, status changed!', data })
        })
        .catch((err) => {
          next(err)
        })
    } else {
      res.status(404).json({ message: 'Investigative Request not Found' })
    }
  } else {
    res.status(401).json({ message: 'Not authorized for this Operations' })
  }
}

const selfOrder = async (req: Request, res: Response, next: NextFunction) => {
  const testStatus = {}
  for (const testId of req.body.requestedTests) {
    testStatus[testId] = 'REQUESTED'
  }

  const newInvestigativeRequest = {
    requestedBy: req.user._id,
    requestedTo: req.body.requestedTo,
    requestedTests: req.body.requestedTests,
    patient: req.body.patient,
    testStatus: testStatus
  }
  if (newInvestigativeRequest.requestedBy == newInvestigativeRequest.patient) {
    InvestigativeRequestDAL.createOne(newInvestigativeRequest)
      .then((data: any) => {
        if (!data)
          return res
            .status(400)
            .json(new CustomError("can't create a Investigative Request", 400))

        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  } else {
    res.status(401).json({ message: "can't create self order " })
  }
}

const getPatientRequests = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const patientId = req.params.id
  InvestigativeRequestDAL.getAllPopulated(
    { patient: patientId },
    'requestedBy',
    'requestedTo',
    'patient',
    'requestedTests'
  )
    .then((data: any) => {
      if (!data) {
        throw new CustomError('Investigative Request is not found', 404)
      }
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const getPatientSelfRequests = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const patientId = req.params.id
  InvestigativeRequestDAL.getAllPopulated(
    { requestedBy: patientId, patient: patientId },
    'requestedBy',
    'requestedTo',
    'requestedTests'
  )
    .then((data: any) => {
      if (!data) {
        res
          .status(404)
          .json(new CustomError('Investigative Request is not found', 404))
      }
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.user
    const investigativeRequestId = req.params.id
    if (role === 'Lab Technician') {
      const IR = await InvestigativeRequestDAL.getOne({
        _id: investigativeRequestId
      })
      if (IR) {
        const resultURL = await streamUpload(
          req,
          'investigative-request-results'
        )
        console.log(resultURL)
        if (resultURL) {
          InvestigativeRequestDAL.updateOne(
            { fileUrl: resultURL },
            investigativeRequestId
          )
            .then((data) => {
              if (!data) {
                throw new CustomError(
                  'Cannot update Investigative Request',
                  400
                )
              }
              res
                .status(200)
                .json({ message: 'Document upload successful', data })
            })
            .catch((err) => {
              res.status(400).json(err)
            })
        } else {
          res
            .status(400)
            .json({ message: 'error uploading document to storage' })
        }
      } else {
        res.status(401).json({ message: 'Investigative Request is not found' })
      }
    } else {
      res.status(401).json({ message: 'Not authorized for this Operations' })
    }
  } catch (error) {
    throw new CustomError('There is an error uploading')
  }
}

export default {
  create,
  getAllInvestigativeRequest,
  getInvestigativeRequest,
  updateInvestigativeRequest,
  sampledStatus,
  selfOrder,
  getPatientRequests,
  getPatientSelfRequests,
  uploadDocument
}
