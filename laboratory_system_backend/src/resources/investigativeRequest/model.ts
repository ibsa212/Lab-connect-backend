import mongoose, { Schema } from 'mongoose'
import IInvestigativeRequestInterface from './interface'

export enum statusTypes {
  REQUESTED = 'REQUESTED',
  SAMPLED = 'SAMPLED',
  RESULT_SENT = 'RECEIVED'
}

const InvestigativeRequestSchema: Schema = new Schema(
  {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      required: true
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedTests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Test',
        required: true
      }
    ],
    testStatus: {
      type: Object,
      required: false
    },
    status: { type: String, enum: statusTypes, default: 'REQUESTED' },
    fileUrl: {type: String, required: false}
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

InvestigativeRequestSchema.set('toJSON', { virtuals: true })

export default mongoose.model<IInvestigativeRequestInterface>(
  'InvestigativeRequest',
  InvestigativeRequestSchema
)
