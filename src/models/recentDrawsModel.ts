import mongoose, { mongo } from "mongoose";

const recentDrawSchems = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    invitations: {
        type: Number,
        required: true,
    },
    crsCutOff: {
        type: Number,
        required: true,
    },
    drawType: {
        type: String,
        required: true,
        enum: ['Express Entry', 'Provincial']
    },
    sourceURL: {   
        type: String,
        required: true,
    },  
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const RecentDraw = mongoose.model('recentDraw', recentDrawSchems);

export default RecentDraw;