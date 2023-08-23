import { Document } from 'mongoose'
import IUserInterface from '../users/interface'
import IFacilityInterface from '../facility/interface'
import ITestInterface from '../tests/interface'

interface IInvestigativeRequestInterface extends Document {
  RequestedBy: IUserInterface['_id']
  RequestedTo: IFacilityInterface['_id']
  patient: IUserInterface['_id']
  RequestedTests: [ITestInterface['_id']]
  testStatus: Object
  status: String
  fileUrl: String
}

export default IInvestigativeRequestInterface
