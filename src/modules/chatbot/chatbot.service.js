const Anthropic = require('@anthropic-ai/sdk');
const ChatSession = require('../../models/chatSession.model');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const sendMessage = async (sessionId, userMessage) => {
    const session = await ChatSession.findById(sessionId);

    // Send last 20 messages to control token cost
    const history = session.history.slice(-20).map(m => ({
        role: m.role,
        content: m.content
    }));

    const response = await client.messages.create({
        model: process.env.CHATBOT_MODEL,
        max_tokens: 1024,
        system: `You are Pola, an AI study assistant for Nigerian learners on StudySync. 
             You help with: study tips, course Q&A, and platform navigation only. 
             Politely redirect off-topic requests.`,
        messages: [...history, { role: 'user', content: userMessage }]
    });

    const reply = response.content[0].text;

    // Save both messages to session history
    session.history.push({ role: 'user', content: userMessage });
    session.history.push({ role: 'assistant', content: reply });
    await session.save();

    return reply;
};

module.exports = { sendMessage };