export type SkillItem = {
  name: string;
  icon: string;
  url: string;
  color: string;
};

export type SkillCategory = {
  name: string;
  items: SkillItem[];
};

export const skillCategories = [
  {
    "name": "Languages & Frameworks",
    "items": [
      {
        "name": "Java (17/21)",
        "icon": "SiOpenjdk",
        "url": "https://www.java.com",
        "color": "#ED8B00"
      },
      {
        "name": "Spring Boot",
        "icon": "SiSpringboot",
        "url": "https://spring.io/projects/spring-boot",
        "color": "#6DB33F"
      },
      {
        "name": "Spring Security",
        "icon": "SiSpringsecurity",
        "url": "https://spring.io/projects/spring-security",
        "color": "#6DB33F"
      },
      {
        "name": "Spring AI",
        "icon": "SiSpring",
        "url": "https://spring.io/projects/spring-ai",
        "color": "#6DB33F"
      },
      {
        "name": "TypeScript",
        "icon": "SiTypescript",
        "url": "https://www.typescriptlang.org",
        "color": "#3178C6"
      },
      {
        "name": "React",
        "icon": "SiReact",
        "url": "https://react.dev",
        "color": "#61DAFB"
      },
      {
        "name": "Angular",
        "icon": "SiAngular",
        "url": "https://angular.io",
        "color": "#DD0031"
      }
    ]
  },
  {
    "name": "AI & LLM Integration",
    "items": [
      {
        "name": "Claude API",
        "icon": "SiAnthropic",
        "url": "https://anthropic.com",
        "color": "#D97706"
      },
      {
        "name": "Google Gemini API",
        "icon": "SiGooglecloud",
        "url": "https://ai.google.dev",
        "color": "#4285F4"
      },
      {
        "name": "OpenAI API",
        "icon": "SiOpenai",
        "url": "https://openai.com",
        "color": "#10A37F"
      },
      {
        "name": "Ollama",
        "icon": "TbCpu",
        "url": "https://ollama.com",
        "color": "#F97316"
      },
      {
        "name": "LangChain4j",
        "icon": "TbTopologyStar3",
        "url": "https://github.com/langchain4j/langchain4j",
        "color": "#14B8A6"
      },
      {
        "name": "RAG",
        "icon": "TbBrain",
        "url": "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
        "color": "#8B5CF6"
      },
      {
        "name": "Prompt Engineering",
        "icon": "TbPrompt",
        "url": "https://www.promptingguide.ai",
        "color": "#EC4899"
      }
    ]
  },
  {
    "name": "Databases & Search",
    "items": [
      {
        "name": "PostgreSQL",
        "icon": "SiPostgresql",
        "url": "https://www.postgresql.org",
        "color": "#4169E1"
      },
      {
        "name": "MySQL",
        "icon": "SiMysql",
        "url": "https://www.mysql.com",
        "color": "#4479A1"
      },
      {
        "name": "Redis",
        "icon": "SiRedis",
        "url": "https://redis.io",
        "color": "#DC382D"
      },
      {
        "name": "pgvector",
        "icon": "SiPostgresql",
        "url": "https://github.com/pgvector/pgvector",
        "color": "#336791"
      },
      {
        "name": "Qdrant",
        "icon": "TbDatabase",
        "url": "https://qdrant.tech",
        "color": "#D946EF"
      }
    ]
  },
  {
    "name": "Distributed Systems & Cloud",
    "items": [
      {
        "name": "Apache Kafka",
        "icon": "SiApachekafka",
        "url": "https://kafka.apache.org",
        "color": "#231F20"
      },
      {
        "name": "Temporal",
        "icon": "SiTemporaldotio",
        "url": "https://temporal.io",
        "color": "#FDB71A"
      },
      {
        "name": "Docker",
        "icon": "SiDocker",
        "url": "https://www.docker.com",
        "color": "#2496ED"
      },
      {
        "name": "Kubernetes",
        "icon": "SiKubernetes",
        "url": "https://kubernetes.io",
        "color": "#326CE5"
      },
      {
        "name": "Rancher",
        "icon": "SiRancher",
        "url": "https://rancher.com",
        "color": "#0075A8"
      },
      {
        "name": "Helm",
        "icon": "SiHelm",
        "url": "https://helm.sh",
        "color": "#0F1689"
      },
      {
        "name": "Azure",
        "icon": "SiMicrosoftazure",
        "url": "https://azure.microsoft.com",
        "color": "#0078D4"
      },
      {
        "name": "REST APIs",
        "icon": "SiOpenapiinitiative",
        "url": "https://swagger.io",
        "color": "#85EA2D"
      }
    ]
  },
  {
    "name": "DevOps & Observability",
    "items": [
      {
        "name": "CI/CD Pipelines",
        "icon": "SiJenkins",
        "url": "https://www.jenkins.io",
        "color": "#D24939"
      },
      {
        "name": "Datadog",
        "icon": "SiDatadog",
        "url": "https://www.datadoghq.com",
        "color": "#632CA6"
      },
      {
        "name": "Prometheus",
        "icon": "SiPrometheus",
        "url": "https://prometheus.io",
        "color": "#E6522C"
      },
      {
        "name": "Grafana",
        "icon": "SiGrafana",
        "url": "https://grafana.com",
        "color": "#F46800"
      },
      {
        "name": "Linux",
        "icon": "SiLinux",
        "url": "https://www.linux.org",
        "color": "#FCC624"
      },
      {
        "name": "Git",
        "icon": "SiGit",
        "url": "https://git-scm.com",
        "color": "#F05032"
      },
      {
        "name": "SonarQube",
        "icon": "SiSonarqube",
        "url": "https://www.sonarqube.org",
        "color": "#4E9BCD"
      },
      {
        "name": "Snyk",
        "icon": "SiSnyk",
        "url": "https://snyk.io",
        "color": "#4C4A73"
      }
    ]
  },
  {
    "name": "Testing & Methodologies",
    "items": [
      {
        "name": "JUnit 5",
        "icon": "SiJunit5",
        "url": "https://junit.org/junit5/",
        "color": "#25A162"
      },
      {
        "name": "Mockito",
        "icon": "TbChecklist",
        "url": "https://site.mockito.org",
        "color": "#78716C"
      },
      {
        "name": "Test-Driven Development (TDD)",
        "icon": "TbTestPipe",
        "url": "https://en.wikipedia.org/wiki/Test-driven_development",
        "color": "#10B981"
      },
      {
        "name": "Microservices Architecture",
        "icon": "TbHierarchy2",
        "url": "https://microservices.io",
        "color": "#6366F1"
      }
    ]
  }
];
