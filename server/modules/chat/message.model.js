import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema({
    matchId:{
        type:Schema.Types.ObjectId,
        ref:'Match',
        required: true
    },
    senderId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    content:{
        type:String,
        required: true,
        trim:true
    },
    readAt:{
        type: Date,
        default: null
    }
},
{
    timestamps: true
});

messageSchema.index({ 
    matchId: 1, 
    createdAt: -1 
}); 

export const Message = mongoose.model('Message', messageSchema);
export default Message;