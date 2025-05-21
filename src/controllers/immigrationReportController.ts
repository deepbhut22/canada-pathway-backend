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


export const generateReport = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const profile = await UserProfile.findOne({ user: userId });

        const oldReport = await ImmigrationReport.findOne({ user: userId });

        if (oldReport && oldReport.expressEntry && oldReport.pnp && oldReport.recommendations) {
            return res.status(200).json(oldReport);
        }

        if (!profile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const expressEntryProfile = await expressEntryReport(profile);

        const pnpProfile = await LLMCall(pnpPrompt(profile, expressEntryProfile));

        const recommendationProfile = await LLMCall(recommendationPrompt(profile));

        const immigrationReport = await ImmigrationReport.findOneAndUpdate(
            { user: userId },
            {
                user: userId,
                expressEntry: expressEntryProfile,
                pnp: pnpProfile,
                recommendations: recommendationProfile,
                $setOnInsert: { createdAt: new Date() },
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        return res.status(200).json(immigrationReport);
    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}


export const regenerateReport = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        
        const profile = await UserProfile.findOne({user: userId});

        if (!profile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const lastReport = await ImmigrationReport.findOne({ user: userId }).sort({ createdAt: -1 });

        const hasProfileChanged = !lastReport || (profile.updatedAt! > lastReport.updatedAt);

        if (!hasProfileChanged) {
            return res.status(400).json({ 
                error: "No recent changes were found in your profile. Please update your immigration-related details to generate a new report."
            });
        }

        const lastFive = (lastReport?.regenerations || [])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentRegeneration = lastReport?.regenerations.filter((r) => new Date(r.date) >= oneWeekAgo) || [];

        if (recentRegeneration.length >= 5) {
            const oldestGen = lastFive[4];
            const nextAvailable = new Date(new Date(oldestGen.date).getTime() + 7 * 24 * 60 * 60 * 1000);

            return res.status(400).json({
                error: `You've reached your weekly limit for generating reports. You can regenerate again on ${nextAvailable.toLocaleString()}.`
            });
        }

        console.log("regenerating report...");
        
        
        const expressEntryProfile = await expressEntryReport(profile);        
        
        const pnpProfile = await LLMCall(pnpPrompt(profile, expressEntryProfile));  
        
        const recommendationProfile = await LLMCall(recommendationPrompt(profile));

        const immigrationReport = await ImmigrationReport.findOneAndUpdate(
            { user: userId },
            { 
                user: userId,
                expressEntry: expressEntryProfile,
                pnp: pnpProfile,
                recommendations: recommendationProfile,
                $setOnInsert: { createdAt: new Date() },
                $push: { regenerations: { date: new Date() } },
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return res.status(200).json(immigrationReport);
    } catch (error) {
        console.error('Error regenerating report:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

const LLMCall = async (prompt: string) => {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const report = completion.choices[0]?.message?.content;

        if (!report) {
            return null;
        }

        return JSON.parse(report);
    } catch (error) {
        console.error('Error calling LLM:', error);
        return null;
    }
}
