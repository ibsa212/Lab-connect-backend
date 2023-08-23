import ITestInterface from './interface'
import mongoose, { Schema } from 'mongoose'

enum testTypes {
  Blood = 'Blood',
  Urine = 'Urine',
  Stool = 'Stool',
  COVID = 'COVID'
}

enum resultTypes {
  RANGE = "Range",
  BINARY = "Binary"
}

const testSchema: Schema = new Schema({
  name: { type: String, required: true },
  testType: {
    type: String,
    enum: testTypes,
    required: true
  },
  sampleType: {
    type: String,
    required: true
  },
  unit: { type: String, required: true },
  testDescription: { type: String },
  resultType: { type: String, enum: resultTypes, required: true }
})

testSchema.set('toJSON', { virtuals: true })

export default mongoose.model<ITestInterface>('Test', testSchema)