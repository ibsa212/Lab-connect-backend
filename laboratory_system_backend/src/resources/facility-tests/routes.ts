import { Router } from 'express'
import facilityTestsController from './controller'
import { auth } from '../../middlewares/auth'

const router = Router()

router
  .route('/')
  .get(facilityTestsController.getAllFacilityTests)
  .post(facilityTestsController.create)
  .delete(facilityTestsController.deleteFacilityTest)

router.route('/self').get(facilityTestsController.selfTests)

router.route('/self/:id').get(facilityTestsController.oneSelfTest)
router
  .route('/available-tests')
  .post(auth, facilityTestsController.getAvailableFacilityTests)

router
  .route('/:id')
  .get(facilityTestsController.getFacilityTests)
  .put(facilityTestsController.updateFacilityTest)


export default router
