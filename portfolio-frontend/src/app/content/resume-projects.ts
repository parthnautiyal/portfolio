export type ResumeProjectItem = {
  title: string;
  tech: string;
  links: { label: string; url: string }[];
  bullets: string[];
};

export const resumeProjects = [
  {
    "title": "OutreachIQ – AI-Powered Job Discovery & Cold Outreach Platform",
    "tech": "Java 17, Spring Boot, Claude API, Gemini API, PostgreSQL, Docker",
    "links": [
      {
        "url": "https://github.com/parthnautiyal/email-automator-springboot",
        "label": "GitHub"
      }
    ],
    "bullets": [
      "Built an autonomous recruitment platform integrating Claude 3.5 and Gemini API for automated job parsing, ATS compatibility scoring (0–100 match rating), and candidate-to-role skill gap analysis.",
      "Engineered concurrent multi-worker search pipelines using CompletableFuture for parallel platform sourcing and automated cold email campaigns via Gmail API (OAuth 2.0) with MX/DNS verification algorithms."
    ]
  },
  {
    "title": "AI Portfolio & Multi-LLM RAG Chatbot",
    "tech": "Spring Boot, React, TypeScript, Gemini API, OpenAI API, Ollama",
    "links": [
      {
        "url": "https://parthnautiyal.vercel.app/",
        "label": "Live"
      },
      {
        "url": "https://github.com/parthnautiyal/portfolio",
        "label": "GitHub"
      }
    ],
    "bullets": [
      "Developed a full-stack platform featuring a RAG-powered conversational assistant orchestrating multiple LLM providers (Google Gemini, OpenAI, and local Ollama/Llama 3) with dynamic resume knowledge-base context injection."
    ]
  }
];
