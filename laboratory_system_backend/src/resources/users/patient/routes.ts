import { Router } from 'express'
import patientController from './controller'
import { auth } from '../../../middlewares/auth'

const router = Router()

router
  .route('/investigative-requests')
  .get(auth, patientController.getMyInvestigativeRequests)

router.route('/available-tests').post(auth, patientController.getTests)
router.route('/lab-result').get(auth, patientController.getMyResults)
router.route('/facility-tests/:id').get(auth, patientController.getFacilityTests)
router.route('/self-tests').get(auth, patientController.getSelfOrderTests)

export default router
