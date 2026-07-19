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

  const { message, history, customApiKey, apiProvider, kbContext } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const geminiKey = customApiKey && apiProvider === 'gemini' 
    ? customApiKey 
    : process.env.GEMINI_API_KEY;
    
  const openaiKey = customApiKey && apiProvider === 'openai' 
    ? customApiKey 
    : process.env.OPENAI_API_KEY;

  const resumeContext = `
You are a helpful, professional assistant representing Parth Nautiyal. Answers should be derived from his career profile:
- SDE II at ZopSmart (Mar 2026 - Present): Scaling 20+ microservices with Kafka event-driven architecture and Temporal workflow orchestrations. Leading system reliability and performance initiatives.
- SDE I at ZopSmart (Jul 2024 - Mar 2026): Built Spring Boot microservices, Kafka, Spring Security, Helm, Kubernetes, Grafana, Datadog. Reduced API latency by ~50%, rollbacks by 70%.
- SDE Intern at ZopSmart (Jan 2024 - Jul 2024): Worked on TDD, JUnit, Mockito, increasing unit test coverage by 45%.
- Skills: Java, Spring Boot, Microservices, Kafka, Temporal, SQL, TypeScript, React, Docker, Kubernetes, Rancher, Helm, Jenkins, Ansible, Grafana, Prometheus, Datadog.
- Education: B.Tech in Computer Science from Lovely Professional University.
- Hobbies & Interests: System Design, Open Source, Obsidian notes, custom CLI tools.

Base answers on the above facts. Be concise, developer-friendly, and polite. If a user asks something completely unrelated, gently redirect them to Parth's work.
  `;

  let activeContext = resumeContext;
  if (kbContext && kbContext.trim().length > 0) {
    activeContext += `\n\nADDITIONAL USER KNOWLEDGE BASE CONTEXT:\n${kbContext}\n\nUse this additional context to answer the user's question if relevant.`;
  }

  if (!geminiKey && !openaiKey) {
    // Attempt local Ollama fallback (useful in vercel dev local mode)
    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          messages: [
            { role: 'system', content: activeContext },
            { role: 'user', content: message }
          ],
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({ reply: data.message.content });
      }
    } catch (e) {
      console.log('Local Ollama instance not reachable from serverless function:', e.message);
    }

    return res.status(200).json({ 
      reply: "Hi! I'm Parth's portfolio chatbot. Currently, no server-side API Key is configured. Once you add GEMINI_API_KEY or paste your own key in Developer Settings, I will answer all your questions using Gemini! For now, Parth is a Full-Stack Engineer at ZopSmart who specializes in Spring Boot, Kafka, and DevOps."
    });
  }

  try {
    if (geminiKey) {
      // Use Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${activeContext}\n\nUser Message: ${message}` }] }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      const reply = result.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
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
          messages: [
            { role: 'system', content: activeContext },
            { role: 'user', content: message }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      const reply = result.choices[0].message.content;
      return res.status(200).json({ reply });
    }
  } catch (error) {
    console.error('Chat function failed:', error.message);
    return res.status(500).json({ error: `Chat service failed: ${error.message}` });
  }
}
