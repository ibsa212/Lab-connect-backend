import { Document } from 'mongoose'
import IAddressInterface from '../address/interface'
import IFacility from '../facility/interface'

interface IUserInterface extends Document {
  firstName: String
  middleName: String
  lastName: String
  email: String
  password: String
  DoB: Date
  gender: String
  profileImage: String
  role: String
  institution: IFacility['_id'][]
  address: IAddressInterface['_id'][]
  identifier:String
  isActive: Boolean
}

export default IUserInterface
