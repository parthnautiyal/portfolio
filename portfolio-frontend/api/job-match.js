import { personal } from '../src/content/personal.ts';
import { experience } from '../src/content/experience.ts';
import { skills } from '../src/content/skills.ts';

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

  const { jobDescription, customApiKey, apiProvider } = req.body;

  if (!jobDescription || jobDescription.trim().length === 0) {
    return res.status(400).json({ error: 'Job description is required' });
  }

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

  // Compile Parth's resume profile as text context for the model
  const parthProfileText = `
Name: ${personal.name}
Title: ${personal.title}
Summary: ${personal.summary}
Email: ${personal.email}
GitHub: ${personal.github}
LinkedIn: ${personal.linkedin}

Experience:
${experience.map(exp => `- ${exp.role} at ${exp.company} (${exp.period}):\n  ${exp.bullets.join('\n  ')}`).join('\n\n')}

Skills:
${skills.map(s => `- ${s.name} (${s.category})`).join('\n')}
  `;

  const systemPrompt = `
You are an expert recruitment advisor.
You are given a candidate profile (Parth Nautiyal) and a target Job Description (JD).
Evaluate the match quality between Parth's profile and the JD.

Provide a structured evaluation containing:
1. matchPercentage: An integer from 0 to 100 representing the fit score.
2. customPitch: A short, compelling 2-3 sentence elevator pitch written directly to the hiring manager explaining why Parth is a great fit (referencing his specific accomplishments like latency reduction or coverage improvement if relevant).
3. matchingSkills: Array of specific key skills requested in the JD that Parth possesses.
4. missingSkills: Array of key skills requested in the JD that Parth does not explicitly mention in his profile (things he might need to learn or cover).
5. relevantProjects: Array of strings matching the names of the most relevant projects Parth has worked on that align with their stack.

Format the output strictly as a JSON object matching this schema:
{
  "matchPercentage": 88,
  "customPitch": "Dear Hiring Manager, Parth's experience at ZopSmart scaling Spring Boot microservices with Kafka aligns perfectly with your requirements for...",
  "matchingSkills": ["Java", "Spring Boot", "Kafka", "Docker", "Kubernetes"],
  "missingSkills": ["React Native", "Go"],
  "relevantProjects": ["Training and Upskilling v2", "Automated Deployment Pipeline"]
}

Return ONLY this JSON block. Do not wrap in markdown \`\`\`json tags. Do not write any conversational text.
  `;

  try {
    let jsonText = '';

    if (geminiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nCandidate Profile:\n${parthProfileText}\n\nJob Description:\n${jobDescription}` }] }],
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
            { role: 'system', content: 'You are a precise job match evaluator.' },
            { role: 'user', content: `${systemPrompt}\n\nCandidate Profile:\n${parthProfileText}\n\nJob Description:\n${jobDescription}` }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      jsonText = result.choices[0].message.content;
    }

    const matchReport = JSON.parse(jsonText.trim());
    return res.status(200).json(matchReport);

  } catch (error) {
    console.error('Failed to run Job Match:', error.message);
    return res.status(500).json({ error: `Job matching failed: ${error.message}` });
  }
}
