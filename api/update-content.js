import fs from 'fs';
import path from 'path';

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

  const isLocal = req.headers.host && (req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1'));
  
  if (!isLocal) {
    return res.status(200).json({ 
      success: true, 
      message: 'Parsed resume data successfully saved to client-side localStorage. Direct disk writing skipped since app is running in cloud production.' 
    });
  }

  const { personal, experience, education, skills } = req.body;
  const contentDir = path.join(process.cwd(), 'src', 'content');

  try {
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }

    if (personal) {
      writeTSFile(contentDir, 'personal.ts', 'personal', personal);
    }
    if (experience) {
      writeTSFile(contentDir, 'experience.ts', 'experience', experience, 'ExperienceItem[]');
    }
    if (education) {
      const eduData = Array.isArray(education) ? education[0] : education;
      let mappedEdu = eduData;
      if (eduData && eduData.school) {
        const cgpaDetail = eduData.details?.find(d => d.toLowerCase().includes('gpa') || d.toLowerCase().includes('cgpa')) || '';
        const cgpa = cgpaDetail.replace(/[^0-9.]/g, '') || '8.9';
        
        mappedEdu = {
          institution: eduData.school,
          location: eduData.location,
          degree: eduData.field ? `${eduData.degree} in ${eduData.field}` : eduData.degree,
          cgpa: cgpa,
          period: eduData.period,
          coursework: eduData.details?.filter(d => !d.toLowerCase().includes('gpa') && !d.toLowerCase().includes('cgpa')) || []
        };
      }
      writeTSFile(contentDir, 'education.ts', 'education', mappedEdu);
    }
    if (skills) {
      let mappedSkills = skills;
      if (Array.isArray(skills) && skills.length > 0 && !skills[0].items) {
        mappedSkills = mapRawSkillsToCategories(skills);
      }
      writeTSFile(contentDir, 'skills.ts', 'skillCategories', mappedSkills, 'SkillCategory[]');
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Local workspace source files (src/content/*.ts) successfully updated and rewritten to disk!' 
    });
  } catch (err) {
    console.error('Failed to write local files:', err);
    return res.status(500).json({ error: `Disk write failed: ${err.message}` });
  }
}

function writeTSFile(contentDir, filename, variableName, data, typeDeclaration = '') {
  const filePath = path.join(contentDir, filename);
  
  let content = '';
  if (filename === 'experience.ts') {
    content += `export type ExperienceItem = {\n  role: string\n  company: string\n  location: string\n  period: string\n  bullets: string[]\n}\n\n`;
  } else if (filename === 'education.ts') {
    content += `export type EducationItem = {\n  institution: string\n  location: string\n  degree: string\n  cgpa: string\n  period: string\n  coursework: string[]\n}\n\n`;
  } else if (filename === 'skills.ts') {
    content += `export type Skill = {\n  name: string\n  icon: string\n  url: string\n  color: string\n}\n\nexport type SkillCategory = {\n  name: string\n  items: Skill[]\n}\n\n`;
  }

  content += `export const ${variableName}${typeDeclaration ? `: ${typeDeclaration}` : ''} = ${JSON.stringify(data, null, 2)}\n`;

  fs.writeFileSync(filePath, content, 'utf8');
}

function mapRawSkillsToCategories(skills) {
  const defaultSkillsFlat = {
    'java': { icon: 'SiOracle', url: 'https://docs.oracle.com/en/java/', color: '#007396' },
    'spring boot': { icon: 'SiSpringboot', url: 'https://spring.io/projects/spring-boot', color: '#6DB33F' },
    'spring security': { icon: 'SiSpringsecurity', url: 'https://spring.io/projects/spring-security', color: '#6DB33F' },
    'typescript': { icon: 'SiTypescript', url: 'https://www.typescriptlang.org/', color: '#3178C6' },
    'angular.js': { icon: 'SiAngular', url: 'https://angular.io/', color: '#DD0031' },
    'mysql': { icon: 'SiMysql', url: 'https://dev.mysql.com/doc/', color: '#4479A1' },
    'mongodb': { icon: 'SiMongodb', url: 'https://www.mongodb.com/docs/', color: '#47A248' },
    'azure': { icon: 'SiMicrosoftazure', url: 'https://learn.microsoft.com/en-us/azure/', color: '#0078D4' },
    'docker': { icon: 'SiDocker', url: 'https://docs.docker.com/', color: '#2496ED' },
    'kubernetes': { icon: 'SiKubernetes', url: 'https://kubernetes.io/docs/', color: '#326CE5' },
    'rancher': { icon: 'SiRancher', url: 'https://rancher.com/docs/', color: '#0075A8' },
    'helm': { icon: 'SiHelm', url: 'https://helm.sh/docs/', color: '#0F1689' },
    'rest api': { icon: 'SiOpenapi', url: 'https://restfulapi.net/', color: '#6BA539' },
    'kafka': { icon: 'SiApachekafka', url: 'https://kafka.apache.org/documentation/', color: '#231F20' },
    'temporal': { icon: 'SiTemporal', url: 'https://docs.temporal.io/', color: '#000000' },
    'grafana': { icon: 'SiGrafana', url: 'https://grafana.com/docs/', color: '#F46800' },
    'prometheus': { icon: 'SiPrometheus', url: 'https://prometheus.io/docs/', color: '#E6522C' },
    'datadog': { icon: 'SiDatadog', url: 'https://docs.datadoghq.com/', color: '#632CA6' },
    'git': { icon: 'SiGit', url: 'https://git-scm.com/doc', color: '#F05032' },
    'linux': { icon: 'SiLinux', url: 'https://www.kernel.org/doc/', color: '#FCC624' },
    'jira': { icon: 'SiJira', url: 'https://www.atlassian.com/software/jira/guides', color: '#0052CC' },
    'confluence': { icon: 'SiConfluence', url: 'https://www.atlassian.com/software/confluence/guides', color: '#172B4D' },
    'sonarqube': { icon: 'SiSonarqube', url: 'https://docs.sonarqube.org/', color: '#4E9BCD' },
    'jfrog': { icon: 'SiJfrog', url: 'https://www.jfrog.com/confluence/', color: '#41BF47' },
    'snyk': { icon: 'SiSnyk', url: 'https://docs.snyk.io/', color: '#4C4A73' }
  };

  const categories = {
    'Programming & Frameworks': [],
    'Databases': [],
    'Cloud & DevOps': [],
    'Integration & Messaging': [],
    'Monitoring & Observability': [],
    'Tools': []
  };

  skills.forEach((skill) => {
    const lowerName = skill.name.toLowerCase();
    const matched = defaultSkillsFlat[lowerName];
    
    const item = {
      name: skill.name,
      icon: matched?.icon || 'SiSimpleicons',
      url: matched?.url || `https://www.google.com/search?q=${encodeURIComponent(skill.name)}`,
      color: matched?.color || '#94a3b8'
    };

    if (skill.category === 'frontend' || skill.category === 'backend') {
      if (['mysql', 'mongodb', 'postgresql', 'redis', 'sql', 'nosql'].includes(lowerName)) {
        categories['Databases'].push(item);
      } else if (['kafka', 'temporal', 'rest api', 'openapi', 'grpc', 'graphql', 'rabbitmq'].includes(lowerName)) {
        categories['Integration & Messaging'].push(item);
      } else {
        categories['Programming & Frameworks'].push(item);
      }
    } else if (skill.category === 'devops') {
      if (['grafana', 'prometheus', 'datadog', 'elk', 'splunk', 'cloudwatch'].includes(lowerName)) {
        categories['Monitoring & Observability'].push(item);
      } else {
        categories['Cloud & DevOps'].push(item);
      }
    } else {
      categories['Tools'].push(item);
    }
  });

  return Object.keys(categories)
    .map(name => ({
      name,
      items: categories[name]
    }))
    .filter(cat => cat.items.length > 0);
}
