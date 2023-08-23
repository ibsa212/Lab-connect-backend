import { Router } from 'express'
import statController from './controller'
import { auth } from '../../middlewares/auth'

const router = Router()

router 
.route('/')
.get(statController.getAllStats)

router
.route('/:id')
.get(auth, statController.getStats)

router
.route('/getdistance') //TODO: not yet implemented for MVP, on halt for v2
.get(statController.getDistanceFromFacilities)
export default router
