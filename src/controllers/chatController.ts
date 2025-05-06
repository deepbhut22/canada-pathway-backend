import { Request, Response } from "express";
import ChatHistory from "../models/chatHistoryModel";
import dotenv from 'dotenv';
import OpenAI from "openai";
import { UserDocument } from "../types";

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

User data: ${JSON.stringify(req.userData)}
    `;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...pastMessages.map(msg => ({
                    role: msg.role as 'user' | 'assistant',  // explicitly cast
                    content: msg.content
                })),
                { role: 'user', content: content }
            ]
        });

        const assistantResponse = completion.choices[0].message.content;

        const answer: {
            role: 'assistant',
            content: string,
            timestamp: Date
        } = {
            role: 'assistant',
            content: assistantResponse || '',
            timestamp: new Date()
        };

        pastMessages.push(answer);

        chatHistory.messages = pastMessages;
        await chatHistory.save();
        
        res.status(201).json(answer);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to add message" });
    }
}