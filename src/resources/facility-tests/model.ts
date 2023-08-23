import mongoose, { Schema } from 'mongoose'
import IFacilityInterface from './interface'

const FacilityTestsSchema: Schema = new Schema(
  {
    facilityId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Facility'
    },
    testId: { type: Schema.Types.ObjectId, required: true, ref: 'Test' },
    tot: { type: String, required: true },
    selfRequest: { type: Boolean, required: true },
    price: { type: Number, required: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

FacilityTestsSchema.set('toJSON', { virtuals: true })

export default mongoose.model<IFacilityInterface>(
  'FacilityTests',
  FacilityTestsSchema
)


