export type ExperienceItem = {
  role: string
  company: string
  location: string
  period: string
  bullets: string[]
}

export const experience: ExperienceItem[] = [
  {
    "role": "Software Development Engineer II",
    "company": "ZopSmart",
    "location": "Bangalore, India",
    "period": "Mar 2026 – Present",
    "bullets": [
      "Designed and scaled 20+ Spring Boot microservices in a distributed, event-driven architecture using Kafka, reducing latency by 50% and improving system throughput and reliability under high-load conditions.",
      "Refactored distributed workflow orchestration using Temporal, decomposing monolithic logic into 11+ activities; implemented retry, idempotency, and failure handling to improve reliability of long-running workflows.",
      "Orchestrated asynchronous workflows across 7+ use cases, enabling parallel processing and improving throughput for high-volume product data pipelines.",
      "Drove platform-level standardization across services, improving configuration consistency and reducing onboarding friction for new services.",
      "Mentored 2 interns and led knowledge-sharing sessions on distributed systems and workflow orchestration."
    ]
  },
  {
    "role": "Software Development Engineer I",
    "company": "ZopSmart",
    "location": "Bangalore, India",
    "period": "Jul 2024 – Mar 2026",
    "bullets": [
      "Built 3+ production-grade microservices with CI/CD pipelines; reduced build time from 9 to 4 mins via caching, pipeline upgrades, and automated retries, cutting failures by 90%.",
      "Developed scalable backend services using Spring Boot and REST APIs, ensuring efficient request handling in distributed environments.",
      "Improved system reliability and observability using Grafana, Prometheus, and Datadog, reducing MTTR and resolving production issues.",
      "Ensured code quality with 85%+ coverage, eliminated vulnerabilities, and enforced testing using JUnit and Mockito.",
      "Collaborated with QA and cross-functional teams to deliver stable, production-ready features with faster turnaround times."
    ]
  }
]
