export type ExperienceItem = {
  role: string
  company: string
  location: string
  period: string
  bullets: string[]
}

export const experience: ExperienceItem[] = [
  {
    role: 'Software Development Engineer I',
    company: 'ZopSmart',
    location: 'Bangalore, India',
    period: 'Jul 2024 – Present',
    bullets: [
      'Designed and scaled Spring Boot microservices using Kafka and Spring Security, cutting response latency by ~50%.',
      'Deployed containerized services via Kubernetes and Helm for consistent, zero-downtime releases.',
      'Built GitHub Actions CI/CD pipelines with validation gates, reducing rollback incidents by 70% and improving reliability.',
      'Implemented observability with Grafana, Prometheus, and Datadog to achieve 99.9% uptime and reduce MTTR by 40%.',
    ],
  },
  {
    role: 'Software Development Engineer Intern',
    company: 'ZopSmart',
    location: 'Bangalore, India',
    period: 'Jan 2024 – Jun 2024',
    bullets: [
      'Built and deployed Java Spring Boot microservices with RESTful APIs.',
      'Led adoption of test-driven development using JUnit and Mockito, increasing code coverage by 45%.',
    ],
  },
]

