import { Router } from 'express'

const router: Router = Router()

// Route imports
import userRouter from '../resources/users/routes'
import facilityRouter from '../resources/facility/routes'
import facilityTestRouter from '../resources/facility-tests/routes'
import testRouter from '../resources/tests/routes'
import investigativeRequestRouter from '../resources/investigativeRequest/routes'
import labResultRouter from '../resources/labResults/routes'
import statsRouter from '../resources/stats/routes'
import sampleRouter from '../resources/sample/routes'
import patientRouter from '../resources/users/patient/routes'

// Higher route declaration
router.use('/users', userRouter)
router.use('/facilities', facilityRouter)
router.use('/facility-tests', facilityTestRouter)
router.use('/tests', testRouter)
router.use('/investigative-requests', investigativeRequestRouter)
router.use('/lab-results', labResultRouter)
router.use('/stats', statsRouter)
router.use('/sample', sampleRouter)
router.use('/patient', patientRouter)

export default router
