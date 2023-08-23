import mongoose, { Schema } from 'mongoose'
import ISampleInterface from './interface'

enum sampleTypes {
    Blood = 'Blood',
    Urine = 'Urine',
    Stool = 'Stool',
    Mucus = 'Mucus',
    COVID = 'COVID'
  }

const SampleSchema: Schema = new Schema(
  {
    investigativeRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'InvestigativeRequest',
      required: true
    },
    sampleType: {
        type: String,
        enum: sampleTypes,
        required: true
      },
      
    kitNumber: {type: String, required: true}
    ,
  },
  {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }

)

SampleSchema.set('toJSON', { virtuals: true })

export default mongoose.model<ISampleInterface>(
  'Sample',
  SampleSchema
)
