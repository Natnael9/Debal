import mongoose from 'mongoose';
import { Schema } from 'mongoose';


const meetupSchema = new Schema({
    matchId:{
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    proposedBy:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date:{
        type:String,
        required: true,
    },
    time:{
        type:String, 
        required: true
    },
    locationNote:{
        type:String,
        trim:true
    },
    status:{
        type:String,
        enum:[
            'proposed','accepted','declined', 'rescheduled'
        ],
        default:'proposed'
    },
    respondedAt:{
        type: Date
    },

},
{
    timestamps:true
}
);


meetupSchema.index({
    matchId: 1,
    createdAt:-1
})


export const Meetup = mongoose.model('Meetup', meetupSchema);
export default Meetup