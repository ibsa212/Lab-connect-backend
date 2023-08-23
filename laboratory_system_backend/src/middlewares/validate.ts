import Joi, { ObjectSchema } from 'joi'
import { NextFunction, Request, Response } from 'express'
import IUserInterface from '../resources/users/interface'
import ILabResult from '../resources/labResults/interface'
import IFacilityInterface from '../resources/facility/interface'

// custom joi validation for mongoose id
export const JoiObjectId = Joi.extend({
  type: 'objectId',
  base: Joi.string(),
  messages: {
    objectId: '"{{#label}}" must be a valid ObjectId(fix it)'
  },
  validate(value, helpers) {
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      return { value, errors: helpers.error('objectId') }
    }
  }
})

export const validateJoi = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body)
    } catch (error) {
      return res.status(422).json({ error })
    }
    next()
  }
}
const addressSchema = Joi.object().keys({
  city: Joi.string(),
  subCity: Joi.string(),
  phone: Joi.string()
    .max(14)
    .min(10)
    .pattern(/^\+[0-9]+$/),
  woreda: Joi.string(),
  houseNo: Joi.string()
})

export const Schemas = {
  user: {
    create: Joi.object<IUserInterface>({
      firstName: Joi.string().alphanum().min(2).max(30),
      middleName: Joi.string().alphanum().min(2).max(30),
      lastName: Joi.string().alphanum().min(2).max(30),
      email: Joi.string().email(),
      gender: Joi.string().min(4).max(6),
      password: Joi.string().min(6).max(30),
      DoB: Joi.date(),
      address: addressSchema,
      role: Joi.string(),
      institution: JoiObjectId.objectId(),
      profileImage: Joi.string().uri(),
      isActive: Joi.boolean()
    })
  },

  labResult: {
    create: Joi.object<ILabResult>({
      investigativeRequestId: JoiObjectId.objectId().required(),
      testId: JoiObjectId.objectId().required(),
      value: Joi.number(),
      positive: Joi.string(),
      filledBy: Joi.string(),
      comment: Joi.string()
    })
  },

  Facility: {
    create: Joi.object<IFacilityInterface>({
      facilityType: Joi.string(),
      facilityName: Joi.string(),
      facilityImages: Joi.array().items(Joi.string().uri()),
      address: JoiObjectId.objectId(),
      description: Joi.string(),
      workHour: Joi.string(),
      website: Joi.string().uri(),
      dateEstablished: Joi.date(),
      level: Joi.number(),
    }),
    ID: JoiObjectId.objectId()
  }
}