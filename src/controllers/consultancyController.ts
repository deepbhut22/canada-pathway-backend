import { Request, Response, NextFunction } from 'express';
import ConsultancyPreBooking from '../models/consultancyPreBookingModel';
export const getConsultancy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const consultancyPreBooking = await ConsultancyPreBooking.findOne({ user: userId });
    if (consultancyPreBooking) {
        res.status(200).json({ message: 'Consultancy fetched successfully', consultancyPreBooking });
    } else {
        await ConsultancyPreBooking.create({ user: userId });
        res.status(201).json({ message: 'Consultancy created successfully', consultancyPreBooking });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

