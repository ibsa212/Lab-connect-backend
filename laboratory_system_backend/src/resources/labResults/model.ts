import mongoose, { Schema } from 'mongoose'
import ILabResult from './interface'

enum booleanResult {
  P = 'Positive',
  N = 'Negative'
}

const LabResultSchema: Schema = new Schema(
  {
    testId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Test'
    },
    investigativeRequestId: { type: Schema.Types.ObjectId, required: true, ref: 'InvestigativeRequest' },
    filledBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    comment: { type: String, required: false },
    value: { type: Number, required: false },
    positive: {type: String, enum: booleanResult, required: false }
     
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

LabResultSchema.set('toJSON', { virtuals: true })

export default mongoose.model<ILabResult>(
  'LabResult',
  LabResultSchema
)