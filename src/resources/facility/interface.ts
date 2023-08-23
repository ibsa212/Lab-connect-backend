import { Document } from 'mongoose'
import IAddressInterface from '../address/interface'

interface IFacilityInterface extends Document {
  facilityType: String
  facilityName: String
  facilityImages: [ String ]
  address: IAddressInterface['_id']
  description: String
  workHour: String
  website: String
  dateEstablished: String
  level: Number
}

export default IFacilityInterface
