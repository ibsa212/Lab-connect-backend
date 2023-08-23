import { Router } from 'express'
import investigativeRequestController from './controller'
import { auth } from '../../middlewares/auth'
import { fileUpload } from '../../middlewares/upload-via-stream'

const router = Router()

router
  .route('/')
  .get(auth, investigativeRequestController.getAllInvestigativeRequest)
  .post(auth, investigativeRequestController.create)

router.route('/self')
  .post(auth, investigativeRequestController.selfOrder)

router
.route('/document-upload/:id')
.post(auth, fileUpload.single('file'),
investigativeRequestController.uploadDocument)

router
  .route('/p/:id')
  .get(auth, investigativeRequestController.getPatientRequests)

router 
  .route('/p/self/:id')
  .get(auth, investigativeRequestController.getPatientSelfRequests)

router
  .route('/:id')
  .get(auth, investigativeRequestController.getInvestigativeRequest)
  .put(auth, investigativeRequestController.updateInvestigativeRequest)
  .patch(auth, investigativeRequestController.sampledStatus)

export default router
