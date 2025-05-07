// controllers/immigrationReportController.ts
import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import UserProfile from '../models/userProfileModel'; // your Mongoose model
import ImmigrationReport from '../models/immigrationReportModel';
import dotenv from 'dotenv';
import { expressEntryPrompt } from '../utils/prompts/expressEntry';
import { pnpPrompt } from '../utils/prompts/pnp';
import { recommendationPrompt } from '../utils/prompts/recommendation';
import { expressEntryReport } from '../utils/llmCalls';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateExpressEntryReport = async (req: Request, res: Response) => {
    try {
        console.log("Generating express entry report...");

        const { userId } = req.params;

        // const oldReport = await ImmigrationReport.findOne({ user: userId });

        // if (oldReport && oldReport.expressEntry) {
        //     console.log("Express entry report found.");
        //     return res.status(200).json(oldReport.expressEntry);
        // }

        const userProfile = await UserProfile.find({ user: userId });

        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const report = await expressEntryReport(userProfile[0].toObject());
        
        if (!report) {
            return res.status(500).json({ error: 'Failed to generate immigration report.' });
        }

        // const parsedReport = JSON.parse(report);
        // console.log(report);

        // Save the report to MongoDB
        const immigrationReport = await ImmigrationReport.findOneAndUpdate(
            { user: userId },
            { 
                user: userId,
                expressEntry: report.expressEntryProfile,
                $setOnInsert: { createdAt: new Date() },
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return res.status(200).json(report);
    } catch (error) {
        console.error('Error generating express entry report:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

export const generatePNPReport = async (req: Request, res: Response) => {
    try {
        console.log("Generating PNP report...");

        const { userId } = req.params;

        const oldReport = await ImmigrationReport.findOne({ user: userId });    

        if (oldReport && oldReport.pnp) {
            console.log("PNP report found.");
            return res.status(200).json(oldReport.pnp);
        }

        const userProfile = await UserProfile.find({ user: userId });

        // console.log(userProfile[0].toObject());

        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const prompt = pnpPrompt(userProfile[0].toObject(), oldReport?.expressEntry);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const report = completion.choices[0]?.message?.content;

        if (!report) {
            return res.status(500).json({ error: 'Failed to generate PNP report.' });
        }   

        const parsedReport = JSON.parse(report);

        // Save the report to MongoDB
        await ImmigrationReport.findOneAndUpdate( 
            { user: userId },
            { 
                user: userId,
                pnp: parsedReport,
                $setOnInsert: { createdAt: new Date() },
                updatedAt: new Date()
            },  
            { upsert: true, new: true }
        );

        return res.status(200).json(parsedReport); 

        // return res.status(200).json();
    } catch (error) {
        console.error('Error generating PNP report:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

export const generateRecommendationReport = async (req: Request, res: Response) => {
    try {
        console.log("Generating recommendation report...");

        const { userId } = req.params;

        const oldReport = await ImmigrationReport.findOne({ user: userId });

        if (oldReport && oldReport.recommendations) {
            console.log("Recommendation report found.");
            return res.status(200).json(oldReport.recommendations);
        }

        const userProfile = await UserProfile.find({ user: userId });
        
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const prompt = recommendationPrompt(userProfile[0].toObject());

        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const report = completion.choices[0]?.message?.content;

        if (!report) {
            return res.status(500).json({ error: 'Failed to generate recommendation report.' });
        } 

        const parsedReport = JSON.parse(report);

        // Save the report to MongoDB
        await ImmigrationReport.findOneAndUpdate( 
            { user: userId },
            { 
                user: userId,
                recommendations: parsedReport,
                $setOnInsert: { createdAt: new Date() },
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return res.status(200).json(parsedReport);
    } catch (error) {
        console.error('Error generating recommendation report:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};