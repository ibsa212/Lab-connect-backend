import { Request, Response, NextFunction } from 'express'
import dataAccessLayer from '../../common/dal'
import { CustomError } from '../../middlewares/utils/errorModel'
import Facility from './model'
import Address from '../address/model'
import db from '../../services/db'
import { streamUpload } from '../../services/bucket'
import FacilityTests from '../facility-tests/model'
import { ObjectId } from 'mongodb'

const FacilityTestDal = dataAccessLayer(FacilityTests)
const FacilityDal = dataAccessLayer(Facility)
const AddressDal = dataAccessLayer(Address)

const getAllFacilities = (req: Request, res: Response, next: NextFunction) => {
  let filter = {}
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi')
    filter = { facilityName: regex }
  }

  FacilityDal.getMany(filter, 'address')
    .then((data: any) => {
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const getFacility = (req: Request, res: Response, next: NextFunction) => {
  const facilityId = req.params.id
  if (ObjectId.isValid(facilityId)) {
    FacilityDal.getOne({ _id: facilityId }, 'address')
      .then((data) => {
        res.status(200).json(data)
      })
      .catch((err) => {
        next(err)
      })
  } else {
    throw new CustomError('Bad Request', 400)
  }
}

const updateFacility = (req: Request, res: Response, next: NextFunction) => {
  const newFacility = req.body
  FacilityDal.updateOne(newFacility, req.params.id)
    .then((data) => {
      if (!data) {
        throw new CustomError('Cannot update Facility', 400)
      }
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const createFacility = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { address, ...newFacility } = req.body
  const workHour = JSON.stringify(newFacility.workHour)

  const session = await db.Connection.startSession()

  try {
    session.startTransaction()
    const newAddress = await AddressDal.createWithTransaction(address, session)
    newFacility.address = newAddress[0]._id
    newFacility.workHour = workHour
    await FacilityDal.createWithTransaction(newFacility, session)
    await session.commitTransaction()

    session.endSession()
    return res
      .status(200)
      .json({ message: 'Facility successfully created transactionally' })
  } catch {
    session.abortTransaction()
    return res
      .status(400)
      .json({ message: "Couldn't create Facility and transaction is aborted" })
  }
}

const deleteFacility = (req: Request, res: Response, next: NextFunction) => {
  FacilityDal.deleteOne(req.params['id'])
    .then((data) => {
      if (!data) {
        throw new CustomError('Error Occured while deleting facility', 404)
      }
      res.status(200).json(data)
    })
    .catch((err) => {
      next(err)
    })
}

const uploadFacilityImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = req.user
    const facilityId = req.params.id
    // if(currentUser.institution == facilityId){ //TODO: implement isMember logic
    if (ObjectId.isValid(facilityId)) {
      const resultURL = await streamUpload(req, 'facilities')
      if (resultURL) {
        FacilityDal.updateOne(
          { $push: { facilityImages: resultURL } },
          req.params.id
        )
          .then((data) => {
            if (!data) {
              throw new CustomError('Cannot update Facility', 400)
            }
            res.status(200).json({ message: 'image upload successful', data })
          })
          .catch((err) => {
            res.status(400).json(err)
          })
      } else {
        res.status(400).json({ message: 'error uploading image to storage' })
      }
    } else {
      throw new CustomError('Bad Request', 400)
    }
    // }else{
    //   throw new CustomError('Not authorized')
    // }
  } catch (error) {
    return res.status(400).json(new CustomError('There is an error uploading', 400))
  }
}

const getAllHospitals =  (req: Request, res: Response, next: NextFunction) => {
    const filter = { facilityType: "Hospital"}
    FacilityDal.getMany(filter)
    .then((data: any) => {
    if (!data) {
      throw new CustomError('Facility not found', 404)
    }
    res.status(200).json(data)
  })
  .catch((err) => {
    next(err)
  })

  }

  


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

export default {
  getAllFacilities,
  createFacility,
  getFacility,
  updateFacility,
  deleteFacility,
  uploadFacilityImage,
  getAllHospitals 
}
