import mongoose from "mongoose";

const faydaSimulatedSchema = new mongoose.Schema({
    idNumber:{
        type: String, 
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    dateOfBirth:{
        type: Date,
        required: true
    }
})

export const FaydaSimulatedRecord = mongoose.model(
  'FaydaSimulatedRecord',
  faydaSimulatedSchema
);