import { Document } from 'mongoose'

interface ILabResult extends Document {
    testId: String
    investigativeRequestId: String
    filledBy: String
    comment: String
    value: number
    positive: String
}

export default ILabResult