import { Router } from 'express'
import facilityController from './controller'
import { auth } from '../../middlewares/auth'
import { fileUpload } from '../../middlewares/upload-via-stream'

const router = Router()

router
  .route('/')
  .get(facilityController.getAllFacilities)
  .post(facilityController.createFacility)

router
  .route('/get-all-hospitals')
  .get(facilityController.getAllHospitals)
router
  .route('/upload-image/:id')
  .post(
    auth,
    fileUpload.single('image'),
    facilityController.uploadFacilityImage
  )

router
  .route('/:id')
  .get(facilityController.getFacility)
  .put(facilityController.updateFacility)
  .delete(facilityController.deleteFacility)

export default router
