import { Request, Response } from 'express';
import Admin from '../models/adminModel';
import User from '../models/userModel';
import ConsultancyPreBooking from '../models/consultancyPreBookingModel';
import UserProfile from '../models/userProfileModel';
import RecentDraw from '../models/recentDrawsModel';
import Consultant from '../models/consultantModel';
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const adminData = await Admin.findOne({ email: email, password: password }).select('-password');

        if (!adminData) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json(adminData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin data' });
    }
}

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const usersInLast30Days = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
        // const usersInLast7Days = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
        const usersInLast24Hours = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
        const consultancyPreBookings = await ConsultancyPreBooking.countDocuments();

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // 1-based (1 = Jan, 12 = Dec)

        const result = await User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lt: new Date(`${currentYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    count: 1
                }
            }
        ]);

        // Create a map from result
        const countMap = new Map(result.map(r => [r.month, r.count]));

        // Only include months up to the current one
        const monthlyUserGrowth = Array.from({ length: currentMonth }, (_, i) => {
            const month = i + 1;
            return {
                date: new Date(currentYear, i, 1), // e.g., 2025-01-01
                count: countMap.get(month) || 0
            };
        });

        //weekly user growth
        const now = new Date();

        // Get Monday of this week
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday = 1
        currentWeekStart.setHours(0, 0, 0, 0);

        // Get start of 4 weeks ago
        const startDate = new Date(currentWeekStart);
        startDate.setDate(startDate.getDate() - 21); // start of 4th week ago

        // Step 1: Get users grouped by ISO week
        const userCounts = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: now }
                }
            },
            {
                $addFields: {
                    year: { $isoWeekYear: "$createdAt" },
                    isoWeek: { $isoWeek: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: {
                        year: "$year",
                        isoWeek: "$isoWeek"
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a Set for fast lookup of results
        const userMap = new Map(
            userCounts.map(entry => [`${entry._id.year}-${entry._id.isoWeek}`, entry.count])
        );

        function getISOWeekNumber(date: Date) {
            const temp = new Date(date.getTime());
            temp.setHours(0, 0, 0, 0);
            // Thursday in current week decides the year
            temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
            const firstThursday = new Date(temp.getFullYear(), 0, 4);
            const weekNumber = Math.floor(
                (temp.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)
            ) + 1;
            return weekNumber;
        }

        // Build the past 4 weeks with Monday dates
        const userWeeklyGrowth = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(currentWeekStart);
            weekStart.setDate(weekStart.getDate() - 7 * i);

            const year = weekStart.getFullYear();
            const weekNum = getISOWeekNumber(weekStart);

            const key = `${year}-${weekNum}`;
            const count = userMap.get(key) || 0;

            const month = weekStart.toLocaleString('default', { month: 'short' });
            const day = weekStart.getDate();

            userWeeklyGrowth.push({
                week: `${month} ${day}`,
                users: count
            });
        }

        const userPerProvince = await UserProfile.aggregate([
            {
                $group: {
                    _id: {
                        $ifNull: ["$basicInfo.province", "Unknown"]
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);


        res.status(200).json({ totalUsers, usersInLast30Days, usersInLast24Hours, consultancyPreBookings, monthlyUserGrowth, userWeeklyGrowth, userPerProvince });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
}

export const addRecentDraws = async (req: Request, res: Response) => {
    try {
        const recentDraw = req.body.data;

        if (recentDraw && typeof recentDraw === 'object') {
            delete recentDraw.id;
        }

        await RecentDraw.create(recentDraw);

        res.status(201).json({message: "new recent draw added successfully."});

    } catch (error) {
        console.log(error);
        res.status(500).json({message: error})
    }
}

export const getAllRecentDraws = async (req: Request, res: Response) => {
    try {
        const allRecentDraws = await RecentDraw.find().sort({ createdAt: -1 });         // most recent first
        res.status(200).json(allRecentDraws);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const addConsultant = async (req: Request, res: Response) => {
    try {
        const consultant = req.body;
        consultant.level = parseInt(consultant.level);
        consultant.serviceStartsFrom = parseInt(consultant.serviceStartsFrom);
        consultant.starRating = parseInt(consultant.starRating);
        consultant.totalNumberOfReviews = parseInt(consultant.totalNumberOfReviews);
        delete consultant.id;
        await Consultant.create(consultant);
        res.status(201).json({message: "new consultant added successfully."});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error})
    }
}   

export const updateConsultant = async (req: Request, res: Response) => {
    try {
        const consultant = req.body;
        consultant.level = parseInt(consultant.level);
        consultant.serviceStartsFrom = parseInt(consultant.serviceStartsFrom);
        consultant.starRating = parseInt(consultant.starRating);
        consultant.totalNumberOfReviews = parseInt(consultant.totalNumberOfReviews);
        // delete consultant.id;
        console.log(consultant);
        const consultantId = consultant._id;
        delete consultant._id;

        await Consultant.findByIdAndUpdate(consultantId, consultant);
        res.status(200).json({message: "consultant updated successfully."});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error})
    }
}

export const getAllConsultants = async (req: Request, res: Response) => {
    try {
        const consultants = await Consultant.find();
        res.status(200).json(consultants);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error})
    }
}