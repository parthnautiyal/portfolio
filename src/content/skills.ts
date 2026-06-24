export type SkillItem = {
  name: string
  icon: string
  url: string
  color: string
}

export type SkillCategory = {
  name: string
  items: SkillItem[]
}

export const skillCategories: SkillCategory[] = [
  {
    name: 'Programming & Frameworks',
    items: [
      { name: 'Java', icon: 'SiOpenjdk', url: 'https://www.java.com', color: '#ED8B00' },
      { name: 'Spring Boot', icon: 'SiSpringboot', url: 'https://spring.io/projects/spring-boot', color: '#6DB33F' },
      { name: 'Spring Security', icon: 'SiSpringsecurity', url: 'https://spring.io/projects/spring-security', color: '#6DB33F' },
      { name: 'TypeScript', icon: 'SiTypescript', url: 'https://www.typescriptlang.org', color: '#3178C6' },
      { name: 'Angular.js', icon: 'SiAngular', url: 'https://angular.io', color: '#DD0031' },
    ]
  },
  {
    name: 'Databases',
    items: [
      { name: 'MySQL', icon: 'SiMysql', url: 'https://www.mysql.com', color: '#4479A1' },
      { name: 'NoSQL', icon: 'SiMongodb', url: 'https://www.mongodb.com', color: '#47A248' },
    ]
  },
  {
    name: 'Cloud & DevOps',
    items: [
      { name: 'Azure', icon: 'SiMicrosoftazure', url: 'https://azure.microsoft.com', color: '#0078D4' },
      { name: 'Docker', icon: 'SiDocker', url: 'https://www.docker.com', color: '#2496ED' },
      { name: 'Kubernetes', icon: 'SiKubernetes', url: 'https://kubernetes.io', color: '#326CE5' },
      { name: 'Rancher', icon: 'SiRancher', url: 'https://rancher.com', color: '#0075A8' },
      { name: 'Helm', icon: 'SiHelm', url: 'https://helm.sh', color: '#0F1689' },
    ]
  },
  {
    name: 'Integration & Messaging',
    items: [
      { name: 'REST', icon: 'SiOpenapiinitiative', url: 'https://swagger.io', color: '#85EA2D' },
      { name: 'Kafka', icon: 'SiApachekafka', url: 'https://kafka.apache.org', color: '#231F20' },
      { name: 'Temporal', icon: 'SiTemporaldotio', url: 'https://temporal.io', color: '#FDB71A' },
    ]
  },
  {
    name: 'Monitoring & Observability',
    items: [
      { name: 'Grafana', icon: 'SiGrafana', url: 'https://grafana.com', color: '#F46800' },
      { name: 'Prometheus', icon: 'SiPrometheus', url: 'https://prometheus.io', color: '#E6522C' },
      { name: 'Datadog', icon: 'SiDatadog', url: 'https://www.datadoghq.com', color: '#632CA6' },
    ]
  },
  {
    name: 'Tools',
    items: [
      { name: 'Git', icon: 'SiGit', url: 'https://git-scm.com', color: '#F05032' },
      { name: 'Linux', icon: 'SiLinux', url: 'https://www.linux.org', color: '#FCC624' },
      { name: 'JIRA', icon: 'SiJira', url: 'https://www.atlassian.com/software/jira', color: '#0052CC' },
      { name: 'Confluence', icon: 'SiConfluence', url: 'https://www.atlassian.com/software/confluence', color: '#172B4D' },
      { name: 'SonarQube', icon: 'SiSonarqube', url: 'https://www.sonarqube.org', color: '#4E9BCD' },
      { name: 'Artifactory', icon: 'SiJfrog', url: 'https://jfrog.com/artifactory/', color: '#40BE46' },
      { name: 'Snyk', icon: 'SiSnyk', url: 'https://snyk.io', color: '#4C4A73' },
    ]
  },
  {
    name: 'Architecture & CS Fundamentals',
    items: [
      { name: 'Design Patterns', icon: 'TbTemplate', url: 'https://refactoring.guru/design-patterns', color: '#9333ea' },
      { name: 'Concurrency', icon: 'TbCpu', url: 'https://docs.oracle.com/javase/tutorial/essential/concurrency/', color: '#0ea5e9' },
    ]
  }
]
