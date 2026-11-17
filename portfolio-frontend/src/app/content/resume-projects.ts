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
      "Built an autonomous recruitment platform integrating Claude 3.5 and Gemini API for automated JD parsing, skill gap analysis, and ATS compatibility scoring (0–100 match rating).",
      "Engineered concurrent multi-worker search pipelines using CompletableFuture and Gmail API (OAuth 2.0) with DNS/MX verification, achieving 98% email deliverability."
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
      "Developed a full-stack platform featuring a RAG conversational assistant orchestrating Google Gemini, OpenAI, and local Ollama with vector context injection for dynamic resume Q&A."
    ]
  }
];
