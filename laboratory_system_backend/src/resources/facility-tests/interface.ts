import { Document } from 'mongoose'

interface IFacilityTestsInterface extends Document {
    facilityId: String
    testID: String
    tot: String
    selfRequest: Boolean
    price: number
}

export default IFacilityTestsInterface
