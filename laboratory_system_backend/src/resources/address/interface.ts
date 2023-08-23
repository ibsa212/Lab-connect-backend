import { Document } from 'mongoose'

interface IAddressInterface extends Document {
  city: String
  subCity: String
  phone: String
  woreda: String
  houseNo: String
  street: String
  // coords: Object
}

export default IAddressInterface
