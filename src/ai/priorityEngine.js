const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzePriority = async (jobs) => {
  try {
    const jobContext = jobs.map(job => ({
      name: job.name,
      command: job.command,
      priority: job.priority || 'medium',
      dependsOn: job.dependsOn || [],
    }));

    const prompt = `
You are an intelligent job scheduler. Analyze these jobs and return an optimized execution order.

Jobs:
${JSON.stringify(jobContext, null, 2)}

Rules:
1. Dependencies must run first
2. Critical/high priority jobs should run before medium/low
3. Independent jobs can run in parallel

Return ONLY a JSON array of job names in optimized order. Example:
["JobA", "JobB", "JobC"]

No explanation, just the JSON array.
    `;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.1,
    });

    const content = response.choices[0].message.content.trim();
    
    // JSON parse 
    const cleanContent = content.replace(/```json|```/g, '').trim();
    const optimizedOrder = JSON.parse(cleanContent);
    
    console.log('🤖 AI optimized order:', optimizedOrder);
    return optimizedOrder;

  } catch (err) {
    console.error('AI Priority Engine error:', err.message);
    return null; // fallback to normal order
  }
};

module.exports = { analyzePriority };