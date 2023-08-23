import { Router } from 'express'
import LabResultController from './controller'
import { auth } from '../../middlewares/auth'
import { validateJoi, Schemas } from '../../middlewares/validate'
import { Schema } from 'mongoose'

const router = Router()

router
  .route('/')
  .get(auth, LabResultController.getAllLabResult)
  .post(auth, validateJoi(Schemas.labResult.create), LabResultController.create)

router
  .route('/:id')
  .get(auth, LabResultController.getLabResult)

router
  .route('/investigative-request/:id')
  .get(auth, LabResultController.getLabResultByInvestigativeRequest)

export default router
