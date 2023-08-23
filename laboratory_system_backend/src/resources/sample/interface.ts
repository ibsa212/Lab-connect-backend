import { Document } from 'mongoose'
import IInvestigativeRequestInterface from '../investigativeRequest/interface'

interface ISampleInterface extends Document {
  investigativeRequestId: IInvestigativeRequestInterface['_id']
  sampleTypes: String 
  kitNumber: string
}

export default ISampleInterface