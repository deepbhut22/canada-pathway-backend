import { timeStamp } from 'console';
import mongoose from 'mongoose';

const consultancyPreBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const ConsultancyPreBooking = mongoose.model('ConsultancyPreBooking', consultancyPreBookingSchema);

export default ConsultancyPreBooking;
    