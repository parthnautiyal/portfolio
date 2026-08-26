export type ExperienceItem = {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};

export const experience = [
  {
    "role": "Software Development Engineer II",
    "company": "ZopSmart",
    "location": "Bangalore, India",
    "period": "Mar 2026 – Present",
    "bullets": [
      "Architected and scaled 20+ Spring Boot microservices with event-driven Kafka streaming pipelines, reducing API latency by 50% and optimizing high-throughput data ingestion pipelines.",
      "Refactored distributed workflow orchestration using Temporal, decomposing monolithic logic into 11+ activities; implemented retries, idempotency, and state persistence critical for long-running workflows and multi-step agent pipelines.",
      "Orchestrated asynchronous data processing across 7+ high-volume use cases, enabling parallel execution and increasing pipeline throughput by 40%.",
      "Spearheaded platform-level architectural standards, reducing onboarding friction for new services; mentored engineers and conducted technical sessions on distributed system resilience."
    ]
  },
  {
    "role": "Software Development Engineer I",
    "company": "ZopSmart",
    "location": "Bangalore, India",
    "period": "Jul 2024 – Mar 2026",
    "bullets": [
      "Built 3+ production-grade microservices with automated CI/CD pipelines; reduced build time from 9 to 4 mins via caching and parallelized stages, cutting deployment failures by 90%.",
      "Engineered high-performance backend REST APIs in Spring Boot, handling high concurrency with 99.9% uptime.",
      "Enhanced system observability using Grafana, Prometheus, and Datadog, reducing MTTR and accelerating incident resolution.",
      "Maintained strict software quality standards with 85%+ test coverage using JUnit and Mockito, eliminating vulnerabilities."
    ]
  },
  {
    "role": "Software Development Engineer Intern",
    "company": "ZopSmart",
    "location": "Bangalore, India",
    "period": "Jan 2024 – Jul 2024",
    "bullets": [
      "Practiced Test-Driven Development (TDD) using JUnit and Mockito, increasing unit validation and test suite coverage by 45%.",
      "Assisted in implementing scalable REST API endpoint controllers, database entity mappings, and local service optimizations.",
      "Collaborated with senior engineers on microservices architecture patterns, Spring Boot best practices, and CI/CD deployment automation."
    ]
  }
];
