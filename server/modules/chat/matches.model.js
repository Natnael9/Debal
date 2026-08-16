import mongoose from "mongoose";
const { Schema } = mongoose;

const matchSchema = new Schema({
    userA:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userB:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: String,
        enum: [
            'active', 'blocked'
        ], 
        default: 'active'
    },

},
{
    timestamps: true
}

);


matchSchema.index({
    userA: 1, 
    userB: 1
},
{
    unique: true
}
)

export const Match = mongoose.model('Match', matchSchema);
export default Match;