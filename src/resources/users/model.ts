import mongoose, { Schema } from 'mongoose'
import IUserInterface from './interface'

enum genderType {
  M = 'Male',
  F = 'Female'
}

enum roleType {
  Doctor = 'Doctor',
  Patient = 'Patient',
  LabTechnician = 'Lab Technician'
}

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, required: true },
    lastName: { type: String, required: true },
    DoB: { type: Date, required: true },
    gender: { type: String, enum: genderType, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    role: { type: String, enum: roleType, default: 'Patient', required: true },
    identifier: { type: String, required: true, index: true },
    institution: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      default: '5f1f1b1b1b1b1b1b1b1b1b1b',
    },
    address: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
    isActive: { type: Boolean, default: false }
  },

  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.middleName}`
})

UserSchema.set('toJSON', { virtuals: true })

export default mongoose.model<IUserInterface>('User', UserSchema)
