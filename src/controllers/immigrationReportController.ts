// controllers/immigrationReportController.ts
import { Request, Response } from 'express';
import { OpenAI } from 'openai';
import UserProfile from '../models/userProfileModel'; // your Mongoose model
import ImmigrationReport from '../models/immigrationReportModel';
import dotenv from 'dotenv';
import { expressEntryPrompt } from '../utils/prompts/expressEntry';
import { pnpPrompt } from '../utils/prompts/pnp';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const immigrationPromptTemplate = (userData: any) => `
You are a Canadian immigration expert. A user has submitted their Express Entry profile using the structured form data below.

Your task is to generate a complete JSON immigration report. You **must calculate the CRS score and eligibility based on the input** — do not use placeholders like "TBD", "To be determined", or leave anything blank.

Your response must strictly follow this format:

{
  "immigrationReport": {
    "lastUpdated": "2025-04-29",
    "profileSummary": {
      "name": "<Full name>",
      "age": <number>,
      "citizenCountry": "<Country>",
      "education": "<Highest education level>",
      "languageProficiency": "<English and/or French level, e.g. CLB 9>",
      "workExperience": "<# of years and NOC>"
    },
    "expressEntryProfile": {
      "crsScore": <calculated number>,
      "scoreBreakdown": {
        "coreHumanCapital": { "score": <number>, "maximum": 460 },
        "spouseFactors": { "score": <number>, "maximum": 40 },
        "skillTransferability": { "score": <number>, "maximum": 100 },
        "additionalPoints": { "score": <number>, "maximum": 600 }
      },
      "eligibilityStatus": [
        {
          "program": "Federal Skilled Worker Program (FSWP)",
          "isEligible": true | false,
          "details": "<reason>"
        },
        {
          "program": "Canadian Experience Class (CEC)",
          "isEligible": true | false,
          "details": "<reason>"
        },
        {
          "program": "Federal Skilled Trades Program (FSTP)",
          "isEligible": true | false,
          "details": "<reason>"
        }
      ],
      "recentDraws": {
        "score": <calculated CRS>,
        "aboveMinimum": <number of draws user would have cleared>,
        "totalDraws": 5
      }
    },
    "provincialPrograms": [<list of suitable PNPs based on score, NOC, or province connections>],
    "alternativePathways": [<list of eligible alternate immigration options with reasons>],
    "recommendations": {
      "scoreImprovements": [<3 tailored actions>],
      "requiredDocuments": [<realistic required docs list>],
      "timeline": [<estimated PR journey timeline>]
    },
    "updates": [
      {
        "title": "Express Entry Draw",
        "date": "2025-04-20",
        "details": "Minimum CRS score: 475",
        "isPrimary": true
      },
      {
        "title": "OINP Tech Draw",
        "date": "2025-04-15",
        "details": "Minimum CRS score: 458",
        "isPrimary": false
      },
      {
        "title": "NOC Updates",
        "date": "2025-04-10",
        "details": "IRCC added 5 new TEER 0 occupations",
        "isPrimary": false
      }
    ]
  }
}

Use only the structured data provided below. Calculate everything from this input:

\`\`\`json
${JSON.stringify(userData, null, 2)}
\`\`\`

❗Do not use placeholders like "TBD" or "unknown". All fields must have concrete values derived from the form data above. Respond with only a JSON object, no markdown, no commentary.
`;

export const generateExpressEntryReport = async (req: Request, res: Response) => {
    try {
        console.log("Generating express entry report...");

        const { userId } = req.params;

        const oldReport = await ImmigrationReport.findOne({ user: userId });

        if (oldReport && oldReport.expressEntry) {
            console.log("Express entry report found.");
            return res.status(200).json(oldReport.expressEntry);
        }

        const userProfile = await UserProfile.find({ user: userId });

        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const prompt = expressEntryPrompt(userProfile[0].toObject());   

        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const report = completion.choices[0]?.message?.content;

        if (!report) {
            return res.status(500).json({ error: 'Failed to generate immigration report.' });
        }

        const parsedReport = JSON.parse(report);

        // Save the report to MongoDB
        const immigrationReport = await ImmigrationReport.findOneAndUpdate(
            { user: userId },
            { 
                user: userId,
                expressEntry: parsedReport.expressEntryProfile,
                $setOnInsert: { createdAt: new Date() },
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({ 
            parsedReport,
            // savedReport: immigrationReport 
        });
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

        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const prompt = pnpPrompt(userProfile[0].toObject());

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

        console.log(parsedReport);

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
    } catch (error) {
        console.error('Error generating PNP report:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
