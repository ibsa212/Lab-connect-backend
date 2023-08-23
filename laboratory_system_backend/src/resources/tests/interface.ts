import mongoose, { Schema, Document } from 'mongoose'

interface ITestInterface extends Document {
  name: string
  testType: string
  sampleType: string
  unit: string
  testDescription: string
  resultType: String
}

export default ITestInterface
