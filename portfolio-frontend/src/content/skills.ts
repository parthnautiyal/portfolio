export type Skill = {
  name: string
  icon: string
  url: string
  color: string
}

export type SkillCategory = {
  name: string
  items: Skill[]
}

export const skillCategories: SkillCategory[] = [
  {
    name: 'Programming & Frameworks',
    items: [
      { name: 'Java', icon: 'SiOracle', url: 'https://docs.oracle.com/en/java/', color: '#007396' },
      { name: 'Spring Boot', icon: 'SiSpringboot', url: 'https://spring.io/projects/spring-boot', color: '#6DB33F' },
      { name: 'Spring Security', icon: 'SiSpringsecurity', url: 'https://spring.io/projects/spring-security', color: '#6DB33F' },
      { name: 'TypeScript', icon: 'SiTypescript', url: 'https://www.typescriptlang.org/', color: '#3178C6' },
      { name: 'Angular.js', icon: 'SiAngular', url: 'https://angular.io/', color: '#DD0031' },
    ],
  },
  {
    name: 'Databases',
    items: [
      { name: 'MySQL', icon: 'SiMysql', url: 'https://dev.mysql.com/doc/', color: '#4479A1' },
      { name: 'MongoDB', icon: 'SiMongodb', url: 'https://www.mongodb.com/docs/', color: '#47A248' },
    ],
  },
  {
    name: 'Cloud & DevOps',
    items: [
      { name: 'Azure', icon: 'SiMicrosoftazure', url: 'https://learn.microsoft.com/en-us/azure/', color: '#0078D4' },
      { name: 'Docker', icon: 'SiDocker', url: 'https://docs.docker.com/', color: '#2496ED' },
      { name: 'Kubernetes', icon: 'SiKubernetes', url: 'https://kubernetes.io/docs/', color: '#326CE5' },
      { name: 'Rancher', icon: 'SiRancher', url: 'https://rancher.com/docs/', color: '#0075A8' },
      { name: 'Helm', icon: 'SiHelm', url: 'https://helm.sh/docs/', color: '#0F1689' },
    ],
  },
  {
    name: 'Integration & Messaging',
    items: [
      { name: 'REST API', icon: 'SiOpenapi', url: 'https://restfulapi.net/', color: '#6BA539' },
      { name: 'Kafka', icon: 'SiApachekafka', url: 'https://kafka.apache.org/documentation/', color: '#231F20' },
      { name: 'Temporal', icon: 'SiTemporal', url: 'https://docs.temporal.io/', color: '#000000' },
    ],
  },
  {
    name: 'Monitoring & Observability',
    items: [
      { name: 'Grafana', icon: 'SiGrafana', url: 'https://grafana.com/docs/', color: '#F46800' },
      { name: 'Prometheus', icon: 'SiPrometheus', url: 'https://prometheus.io/docs/', color: '#E6522C' },
      { name: 'Datadog', icon: 'SiDatadog', url: 'https://docs.datadoghq.com/', color: '#632CA6' },
    ],
  },
  {
    name: 'Tools',
    items: [
      { name: 'Git', icon: 'SiGit', url: 'https://git-scm.com/doc', color: '#F05032' },
      { name: 'Linux', icon: 'SiLinux', url: 'https://www.kernel.org/doc/', color: '#FCC624' },
      { name: 'JIRA', icon: 'SiJira', url: 'https://www.atlassian.com/software/jira/guides', color: '#0052CC' },
      { name: 'Confluence', icon: 'SiConfluence', url: 'https://www.atlassian.com/software/confluence/guides', color: '#172B4D' },
      { name: 'SonarQube', icon: 'SiSonarqube', url: 'https://docs.sonarqube.org/', color: '#4E9BCD' },
      { name: 'JFrog', icon: 'SiJfrog', url: 'https://www.jfrog.com/confluence/', color: '#41BF47' },
      { name: 'Snyk', icon: 'SiSnyk', url: 'https://docs.snyk.io/', color: '#4C4A73' },
    ],
  },
]

