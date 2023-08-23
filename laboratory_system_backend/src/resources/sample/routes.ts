import { Router } from 'express'
import sampleController from './controller'
import { auth } from '../../middlewares/auth'

const router = Router()

router
  .route('/')
  .post(auth, sampleController.create)
  .get(auth, sampleController.getSamples)
  
router
 .route('/facility-samples')
 .get(auth,sampleController.getSamplesOfThisFacility)

router
    .route('/kit/:number')
    .get(auth, sampleController.getKitpopluated)

router
    .route('/IR/:id')
    .get(auth, sampleController.getIRpopulated)

router
    .route('/sampleType/:type')
    .get(auth, sampleController.getSampleTypepopluated)


router
    .route('/:id')
    .get(auth, sampleController.getSampleIdpopulated)

export default router
