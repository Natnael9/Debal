import mongoose from "mongoose";

const faydaSimulatedDataSchema = new mongoose.Schema({
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
        type: date,
        required: true
    }
})