export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(450).json({ error: 'Method not allowed' });
  }

  const { resumeText, customApiKey, apiProvider } = req.body;

  if (!resumeText || resumeText.trim().length === 0) {
    return res.status(400).json({ error: 'Resume text is required' });
  }

  // 1. Resolve API Keys (Check client override first, then backend environment variable)
  const geminiKey = customApiKey && apiProvider === 'gemini' 
    ? customApiKey 
    : process.env.GEMINI_API_KEY;
    
  const openaiKey = customApiKey && apiProvider === 'openai' 
    ? customApiKey 
    : process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return res.status(400).json({ 
      error: 'No API key configured. Please set GEMINI_API_KEY on the server or provide a custom key in the Developer Settings panel.' 
    });
  }

  // 2. Prepare the HackerRank-based ATS Scorer system prompt
  const systemPrompt = `
You are HackerRank's AI Hiring Agent (cloned from interviewstreet/hiring-agent).
Evaluate the provided resume against standard industry ATS dimensions. Be objective, strict, and evidence-based. 

Analyze the candidate resume across 4 categories:
1. Technical Depth (Self-directed projects, complexity of implementation, databases, concurrency, design patterns).
2. Production Experience (Professional roles, scale metrics, CI/CD pipelines, containerization, cloud systems).
3. Tools & Breadth (Tech stack versatility, programming languages, database languages, DevOps tools, observability).
4. Engineering Rigor (Unit testing, code coverage, documentation, git collaboration, clean coding practices).

Calculate a score (0 to 100) for each category. For each category, provide:
- A list of "evidence" (specific statements from the resume proving this capability).
- A list of "bonusPoints" (outstanding skills, metrics, or certifications).
- A list of "deductions" (weak spots, lack of metrics, gaps in knowledge).

Format the output strictly as a JSON object matching this schema:
{
  "overallScore": 85,
  "analysis": "A concise 2-3 paragraph summary of candidate strengths and clear areas of improvement...",
  "categories": [
    {
      "name": "Technical Depth",
      "score": 82,
      "evidence": ["Developed X microservice using Kafka"],
      "bonusPoints": ["Used Kafka for event streaming"],
      "deductions": ["No mention of deep query optimization"]
    },
    ...
  ]
}

Return ONLY this JSON block. Do not wrap in markdown \`\`\`json tags. Do not write any conversational text.
  `;

  try {
    let jsonText = '';

    if (geminiKey) {
      // Use Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nResume Text:\n${resumeText}` }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      jsonText = result.candidates[0].content.parts[0].text;
    } else {
      // Use OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a precise JSON evaluator.' },
            { role: 'user', content: `${systemPrompt}\n\nResume Text:\n${resumeText}` }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      jsonText = result.choices[0].message.content;
    }

    const evaluation = JSON.parse(jsonText.trim());
    return res.status(200).json(evaluation);

  } catch (error) {
    console.error('Failed to run ATS Scan:', error.message);
    return res.status(500).json({ error: `ATS scanner failed: ${error.message}` });
  }
}
