const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const generateLearningPath = async (learnerProfile) => {
  const { course, learningIntent, currentLevel, schedule } = learnerProfile;

  const weeklyHours = schedule.hoursPerDay * schedule.daysPerWeek;

  try {
    const response = await client.messages.create({
      model: process.env.PATH_GEN_MODEL,
      max_tokens: 1500,
      system: `You are a learning path generator for Nigerian university students 
                     and early career professionals. Generate structured, curated course 
                     sequences. Always factor in the learner's available time to give 
                     realistic durations and deadlines. Respond in JSON only.`,
      messages: [{
        role: 'user',
        content: `Generate a personalized learning path for:
                    - Course/Field: ${course}
                    - Goal: ${learningIntent}
                    - Current Level: ${currentLevel}
                    - Hours per day: ${schedule.hoursPerDay}
                    - Days per week: ${schedule.daysPerWeek}
                    - Weekly study hours: ${weeklyHours}
                    - Preferred time: ${schedule.preferredTime}

                    Return JSON in this exact format:
                    {
                        "estimatedWeeks": <number>,
                        "weeklyHours": <number>,
                        "summary": "<one sentence overview>",
                        "stages": [
                            {
                                "order": 1,
                                "title": "<stage title>",
                                "description": "<what they will learn>",
                                "estimatedWeeks": <number>,
                                "hoursRequired": <number>
                            }
                        ]
                    }`
      }]
    });

    const raw = response.content[0].text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    return JSON.parse(raw);

  } catch (err) {
    console.error('AI path generation error:', err.message);
    throw new Error('AI service is temporarily unavailable. Please try again.');
  }
};

module.exports = { generateLearningPath };