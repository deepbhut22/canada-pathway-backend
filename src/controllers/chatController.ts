import { Request, Response } from "express";
import ChatHistory from "../models/chatHistoryModel";
import dotenv from 'dotenv';
import OpenAI from "openai";
import UserProfile from "../models/userProfileModel";
import ImmigrationReport from "../models/immigrationReportModel";
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getChatHistory = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        console.log(userId);
        const chatHistory = await ChatHistory.findOne({ userId });
        res.status(200).json(chatHistory);
        
    } catch (error) {
        res.status(500).json({ error: "Failed to get chat history" });
    }
}

export const addMessage = async (req: Request, res: Response) => {
    try {
        const { role, content } = req.body;
        const userId = req.params.userId;       

        if ( !role || !content) {
            return res.status(400).json({ error: 'role, and content are required.' });
        }

        const userProfile = await UserProfile.findOne({ user: userId });    
        const reportData = await ImmigrationReport.findOne({ user: userId });

        const newMessage = {
            role,
            content,
            timestamp: new Date()
        };
        
        let chatHistory = await ChatHistory.findOne({ userId });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId,
                messages: [newMessage]
            });
        } else {
            chatHistory.messages.push(newMessage);
            await chatHistory.save();
        }

        const pastMessages = chatHistory?.messages || [];

        const systemPrompt = `
You are a helpful assistant specialized in Canadian immigration. Only answer questions strictly related to Canadian immigration policies, processes, and requirements.

Do not perform or calculate any Comprehensive Ranking System (CRS) scores or point‑based assessments yourself. If the user asks about their CRS score or points, you can scan the report data and response from that if you find that perticular data in the report otherwise respond by asking them to consult their generated report for those details.

The user’s report data is provided in JSON under “Report data.” Some or all fields in that JSON may be null (i.e., labels exist but values are missing). In those cases:
- Treat null values as “information not yet available.”
- Do not make assumptions or fabricate data.
- If the user asks about a missing data point, remind them to check or update their profile for that detail.
- Continue to answer other questions normally using available data and your immigration expertise.
- If the user asks about recent Express Entry draws, immigration trends, or Canadian immigration news, advise them to explore the Statistics, Latest News, or Resources section on our website for the most up-to-date information.

Respond in a clear, concise, and precise manner. Avoid long explanations unless explicitly asked for details.

User data: ${JSON.stringify(userProfile)}
Report data: ${JSON.stringify(reportData ?? null)}
`;

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROK_API_KEY}` // or hardcoded token
            },
            body: JSON.stringify({
                model: 'grok-3-mini-beta',
                temperature: 0,
                stream: false,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...pastMessages.map(msg => ({
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content
                    })),
                    { role: 'user', content: content }
                ]
            })
        });

        const data = await response.json();    
        const assistantResponse = data.choices?.[0]?.message?.content;


        const answer: {
            role: 'assistant',
            content: string,
            timestamp: Date
        } = {
            role: 'assistant',
            content: assistantResponse,
            timestamp: new Date()
        };

        console.log(answer);

        pastMessages.push(answer);

        chatHistory.messages = pastMessages;    
        await chatHistory.save();
        
        res.status(201).json(answer);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to add message" });
    }
}