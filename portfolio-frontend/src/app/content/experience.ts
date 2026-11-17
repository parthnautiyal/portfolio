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
      "Architected and scaled 20+ Spring Boot microservices with event-driven Kafka streaming pipelines, reducing API latency by 50% and optimizing high-throughput data ingestion across production workloads.",
      "Re-architected distributed workflows into Temporal state machines, decomposing monolith logic into 11+ idempotent activities to eliminate state loss and achieve 99.99% fault recovery.",
      "Orchestrated asynchronous data processing using multi-threaded consumer groups, enabling parallel execution and increasing pipeline throughput by 40%.",
      "Established platform microservice standards and automated CI quality gates, cutting service onboarding time by 60% and mentoring 8+ engineers on distributed resilience."
    ]
  },
  {
    "role": "Software Development Engineer I",
    "company": "ZopSmart",
    "location": "Bangalore, India",
    "period": "Jul 2024 – Mar 2026",
    "bullets": [
      "Engineered high-throughput REST APIs in Spring Boot with Redis caching and connection pool tuning, sustaining high concurrency with 99.9% uptime.",
      "Built 3+ production-grade microservices with automated CI/CD pipelines, reducing build time from 9 to 4 mins via caching and cutting deployment failures by 90%.",
      "Standardized observability using Prometheus, Grafana, and Datadog, reducing MTTR by 35% through proactive anomaly alerting and distributed tracing.",
      "Enforced rigorous software quality with 85%+ test coverage using JUnit and Mockito, eliminating critical regression defects across release cycles."
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
