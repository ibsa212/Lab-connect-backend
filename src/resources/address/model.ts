import mongoose, { Schema } from 'mongoose'
import IAddressInterface from '../address/interface'

enum subCities {
  AD = 'Arada',
  AK = 'Addis Ketema',
  Ld = 'Lideta',
  KK = 'Kolfe keranio',
  GL = 'Gullele',
  BL = 'Bole',
  YK = 'Yeka',
  AQ = 'Akaki Kality',
  NK = 'Nifas Silk',
  LM = 'Lami Kura',
  KR = 'Kirkos'
}

const AddressSchema: Schema = new Schema(
  {
    city: { type: String, required: true },
    subCity: { type: String, enum: subCities, required: false },
    phone: { type: String, required: true, unique: true, index: true },
    woreda: { type: String, required: true },
    houseNo: { type: String, unique: false },
    street: { type: String, required: false }
    // coords: { type: { type: 'Points' }, coordinates: [Number] }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

AddressSchema.set('toJSON', { virtuals: true })

export default mongoose.model<IAddressInterface>('Address', AddressSchema)
