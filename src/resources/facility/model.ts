import mongoose, { Schema } from 'mongoose'
import IFacilityInterface from './interface'

const FacilitySchema: Schema = new Schema(
  {
    facilityType: {
      type: String,
      required: true,
      default: 'Laboratory',
      minlength: 1,
      maxlength: 250
    },
    facilityName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 250,
      unique: true,
      index: true
    },
    facilityImages: [ { type : String } ],
    address: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    description: { type: String, required: false },
    workHour: { type: String, required: true },
    website: { type: String, default: 'https://hakimhub.com/facilities' },
    dateEstablished: { type: Date, required: false },
    level:{ type: Number, default:3 }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

FacilitySchema.set('toJSON', { virtuals: true })

export default mongoose.model<IFacilityInterface>('Facility', FacilitySchema)
