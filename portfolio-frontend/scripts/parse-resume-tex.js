#!/usr/bin/env node
/**
 * scripts/parse-resume-tex.js
 *
 * Deterministic, zero-dependency parser that reads Parth_Nautiyal_Resume.tex
 * and synchronizes the website's content files:
 *   - portfolio-frontend/src/app/content/personal.ts
 *   - portfolio-frontend/src/app/content/experience.ts
 *   - portfolio-frontend/src/app/content/skills.ts
 *   - portfolio-frontend/src/app/content/education.ts
 *   - portfolio-frontend/src/app/content/resume-projects.ts
 *
 * Usage: node scripts/parse-resume-tex.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

const candidateTexPaths = [
  path.join(rootDir, 'portfolio-frontend', 'public', 'Parth_Nautiyal_Resume.tex'),
  path.join(rootDir, 'public', 'Parth_Nautiyal_Resume.tex'),
  path.join(process.cwd(), 'public', 'Parth_Nautiyal_Resume.tex'),
  path.join(process.cwd(), 'portfolio-frontend', 'public', 'Parth_Nautiyal_Resume.tex'),
  path.join(rootDir, 'Parth_Nautiyal_Resume.tex'),
  path.join(rootDir, '..', 'Parth_Nautiyal_Resume.tex'),
  path.join(process.cwd(), 'Parth_Nautiyal_Resume.tex'),
  path.join(process.cwd(), '..', 'Parth_Nautiyal_Resume.tex'),
  path.join(__dirname, '..', 'Parth_Nautiyal_Resume.tex')
];

const TEX_FILE_PATH = candidateTexPaths.find(p => fs.existsSync(p)) || candidateTexPaths[0];

const candidateTargetDirs = [
  path.join(rootDir, 'portfolio-frontend', 'src', 'app', 'content'),
  path.join(process.cwd(), 'portfolio-frontend', 'src', 'app', 'content'),
  path.join(process.cwd(), 'src', 'app', 'content')
];

const TARGET_DIRS = candidateTargetDirs.filter((dir, idx, arr) => 
  arr.indexOf(dir) === idx && fs.existsSync(dir)
);

// Map of common skill names to their icons and brand colors
const SKILL_METADATA = {
  'Java': { icon: 'SiOpenjdk', url: 'https://www.java.com', color: '#ED8B00' },
  'Java (17/21)': { icon: 'SiOpenjdk', url: 'https://www.java.com', color: '#ED8B00' },
  'Spring Boot': { icon: 'SiSpringboot', url: 'https://spring.io/projects/spring-boot', color: '#6DB33F' },
  'Spring Security': { icon: 'SiSpringsecurity', url: 'https://spring.io/projects/spring-security', color: '#6DB33F' },
  'Spring AI': { icon: 'SiSpring', url: 'https://spring.io/projects/spring-ai', color: '#6DB33F' },
  'TypeScript': { icon: 'SiTypescript', url: 'https://www.typescriptlang.org', color: '#3178C6' },
  'React': { icon: 'SiReact', url: 'https://react.dev', color: '#61DAFB' },
  'Angular': { icon: 'SiAngular', url: 'https://angular.io', color: '#DD0031' },
  'Angular.js': { icon: 'SiAngular', url: 'https://angular.io', color: '#DD0031' },
  'Claude API': { icon: 'SiAnthropic', url: 'https://anthropic.com', color: '#D97706' },
  'Google Gemini API': { icon: 'SiGooglecloud', url: 'https://ai.google.dev', color: '#4285F4' },
  'OpenAI API': { icon: 'SiOpenai', url: 'https://openai.com', color: '#10A37F' },
  'Ollama': { icon: 'TbCpu', url: 'https://ollama.com', color: '#F97316' },
  'LangChain4j': { icon: 'TbTopologyStar3', url: 'https://github.com/langchain4j/langchain4j', color: '#14B8A6' },
  'RAG': { icon: 'TbBrain', url: 'https://en.wikipedia.org/wiki/Retrieval-augmented_generation', color: '#8B5CF6' },
  'Prompt Engineering': { icon: 'TbPrompt', url: 'https://www.promptingguide.ai', color: '#EC4899' },
  'PostgreSQL': { icon: 'SiPostgresql', url: 'https://www.postgresql.org', color: '#4169E1' },
  'MySQL': { icon: 'SiMysql', url: 'https://www.mysql.com', color: '#4479A1' },
  'Redis': { icon: 'SiRedis', url: 'https://redis.io', color: '#DC382D' },
  'pgvector': { icon: 'SiPostgresql', url: 'https://github.com/pgvector/pgvector', color: '#336791' },
  'Qdrant': { icon: 'TbDatabase', url: 'https://qdrant.tech', color: '#D946EF' },
  'Apache Kafka': { icon: 'SiApachekafka', url: 'https://kafka.apache.org', color: '#231F20' },
  'Kafka': { icon: 'SiApachekafka', url: 'https://kafka.apache.org', color: '#231F20' },
  'Temporal': { icon: 'SiTemporaldotio', url: 'https://temporal.io', color: '#FDB71A' },
  'Docker': { icon: 'SiDocker', url: 'https://www.docker.com', color: '#2496ED' },
  'Kubernetes': { icon: 'SiKubernetes', url: 'https://kubernetes.io', color: '#326CE5' },
  'Rancher': { icon: 'SiRancher', url: 'https://rancher.com', color: '#0075A8' },
  'Helm': { icon: 'SiHelm', url: 'https://helm.sh', color: '#0F1689' },
  'Azure': { icon: 'SiMicrosoftazure', url: 'https://azure.microsoft.com', color: '#0078D4' },
  'REST APIs': { icon: 'SiOpenapiinitiative', url: 'https://swagger.io', color: '#85EA2D' },
  'REST': { icon: 'SiOpenapiinitiative', url: 'https://swagger.io', color: '#85EA2D' },
  'CI/CD Pipelines': { icon: 'SiJenkins', url: 'https://www.jenkins.io', color: '#D24939' },
  'Datadog': { icon: 'SiDatadog', url: 'https://www.datadoghq.com', color: '#632CA6' },
  'Prometheus': { icon: 'SiPrometheus', url: 'https://prometheus.io', color: '#E6522C' },
  'Grafana': { icon: 'SiGrafana', url: 'https://grafana.com', color: '#F46800' },
  'Linux': { icon: 'SiLinux', url: 'https://www.linux.org', color: '#FCC624' },
  'Git': { icon: 'SiGit', url: 'https://git-scm.com', color: '#F05032' },
  'SonarQube': { icon: 'SiSonarqube', url: 'https://www.sonarqube.org', color: '#4E9BCD' },
  'Snyk': { icon: 'SiSnyk', url: 'https://snyk.io', color: '#4C4A73' },
  'JUnit 5': { icon: 'SiJunit5', url: 'https://junit.org/junit5/', color: '#25A162' },
  'Mockito': { icon: 'TbChecklist', url: 'https://site.mockito.org', color: '#78716C' },
  'Test-Driven Development (TDD)': { icon: 'TbTestPipe', url: 'https://en.wikipedia.org/wiki/Test-driven_development', color: '#10B981' },
  'Microservices Architecture': { icon: 'TbHierarchy2', url: 'https://microservices.io', color: '#6366F1' },
  'Design Patterns': { icon: 'TbTemplate', url: 'https://refactoring.guru/design-patterns', color: '#9333ea' },
  'Concurrency': { icon: 'TbCpu', url: 'https://docs.oracle.com/javase/tutorial/essential/concurrency/', color: '#0ea5e9' },
  'JIRA': { icon: 'SiJira', url: 'https://www.atlassian.com/software/jira', color: '#0052CC' },
  'Confluence': { icon: 'SiConfluence', url: 'https://www.atlassian.com/software/confluence', color: '#172B4D' },
  'Artifactory': { icon: 'SiJfrog', url: 'https://jfrog.com/artifactory/', color: '#40BE46' },
  'JMeter': { icon: 'SiApachejmeter', url: 'https://jmeter.apache.org', color: '#D22128' }
};

function cleanLatex(text) {
  if (!text) return '';
  return text
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, '$1')
    .replace(/\\small\{([^}]+)\}/g, '$1')
    .replace(/\\LARGE\s*/g, '')
    .replace(/\\vspace\{[^}]+\}/g, '')
    .replace(/\\hfill/g, '')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&')
    .replace(/\\#/g, '#')
    .replace(/\\\$/g, '$')
    .replace(/\\_/g, '_')
    .replace(/\\textbar/g, '|')
    .replace(/\\textbullet/g, '•')
    .replace(/---/g, '—')
    .replace(/--/g, '–')
    .replace(/\\\\/g, '')
    .replace(/~/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePersonal(tex) {
  const nameMatch = tex.match(/\\textbf\{\{\\LARGE\s+([^}]+)\}\}/) || tex.match(/\\textbf\{\\LARGE\s+([^}]+)\}/);
  const name = nameMatch ? nameMatch[1].trim() : 'Parth Nautiyal';

  const emailMatch = tex.match(/\\href\{mailto:([^}]+)\}/);
  const email = emailMatch ? emailMatch[1].trim() : 'parthnautiyal2002@gmail.com';

  const phoneMatch = tex.match(/\+91\s*[0-9\s-]+/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '+91 7453886885';

  const linkedinMatch = tex.match(/\\href\{https?:\/\/(?:www\.)?linkedin\.com\/in\/([^}]+)\}/);
  const linkedin = linkedinMatch ? `https://www.linkedin.com/in/${linkedinMatch[1].replace(/\/$/, '')}/` : 'https://www.linkedin.com/in/parth-nautiyal/';

  const githubMatch = tex.match(/\\href\{https?:\/\/(?:www\.)?github\.com\/([^}]+)\}/);
  const github = githubMatch ? `https://github.com/${githubMatch[1].replace(/\/$/, '')}` : 'https://github.com/parthnautiyal';

  const leetcodeMatch = tex.match(/\\href\{https?:\/\/(?:www\.)?leetcode\.com\/u?\/([^}]+)\}/);
  const leetcode = leetcodeMatch ? `https://leetcode.com/u/${leetcodeMatch[1].replace(/\/$/, '')}/` : 'https://leetcode.com/u/parth_nautiyal/';

  const summaryMatch = tex.match(/\\section\*?\{Summary\}[\s\S]*?\\begin\{small\}([\s\S]*?)\\end\{small\}/);
  let summary = summaryMatch ? cleanLatex(summaryMatch[1]) : '';
  if (!summary) {
    const summaryFallback = tex.match(/\\section\*?\{Summary\}([\s\S]*?)(?:\\section|\n\s*\n\s*\\)/);
    summary = summaryFallback ? cleanLatex(summaryFallback[1]) : 'Building reliable systems at scale.';
  }

  return {
    name,
    title: 'Building reliable systems at scale.',
    summary,
    location: 'Bangalore, India',
    email,
    phone,
    github,
    linkedin,
    leetcode,
    resumeUrl: '/Parth_Nautiyal_Resume.pdf'
  };
}

function parseExperience(tex) {
  const expSectionMatch = tex.match(/\\section\{Professional Experience\}([\s\S]*?)(?:\\section\{|$)/);
  if (!expSectionMatch) return [];

  const rawSection = expSectionMatch[1];
  const items = [];

  let currentCompany = 'ZopSmart';
  let currentLocation = 'Bangalore, India';

  const companyMatch = rawSection.match(/\\textbf\{([^}]+)\}\s*\\hfill\s*\\textit\{([^}]+)\}/);
  if (companyMatch) {
    currentCompany = cleanLatex(companyMatch[1]);
    currentLocation = cleanLatex(companyMatch[2]);
  }

  const roleRegex = /\\textit\{([^}]+)\}\s*\\hfill\s*\\textit\{([^}]+)\}[\s\S]*?\\begin\{itemize\}[\s\S]*?\]([\s\S]*?)\\end\{itemize\}/g;
  let match;

  while ((match = roleRegex.exec(rawSection)) !== null) {
    const role = cleanLatex(match[1]);
    const period = cleanLatex(match[2]);
    const rawBullets = match[3];

    const bulletList = [];
    const itemRegex = /\\item\s+([\s\S]*?)(?=\\item|$)/g;
    let bMatch;
    while ((bMatch = itemRegex.exec(rawBullets)) !== null) {
      const cleanBullet = cleanLatex(bMatch[1]);
      if (cleanBullet) {
        bulletList.push(cleanBullet);
      }
    }

    items.push({
      role,
      company: currentCompany,
      location: currentLocation,
      period,
      bullets: bulletList
    });
  }

  // Guarantee SDE Internship is preserved on the website even if omitted from 1-page LaTeX resume
  const hasInternship = items.some(item => item.role.toLowerCase().includes('intern'));
  if (!hasInternship) {
    items.push({
      role: 'Software Development Engineer Intern',
      company: 'ZopSmart',
      location: 'Bangalore, India',
      period: 'Jan 2024 – Jul 2024',
      bullets: [
        'Practiced Test-Driven Development (TDD) using JUnit and Mockito, increasing unit validation and test suite coverage by 45%.',
        'Assisted in implementing scalable REST API endpoint controllers, database entity mappings, and local service optimizations.',
        'Collaborated with senior engineers on microservices architecture patterns, Spring Boot best practices, and CI/CD deployment automation.'
      ]
    });
  }

  return items;
}

function parseProjects(tex) {
  const projectsSectionMatch = tex.match(/\\section\{Projects\}([\s\S]*?)(?:\\section\{|$)/);
  if (!projectsSectionMatch) return [];

  const rawSection = projectsSectionMatch[1];
  const projects = [];

  const projectBlocks = rawSection.split('\\end{itemize}').filter(b => b.includes('\\begin{itemize}'));

  for (const block of projectBlocks) {
    const parts = block.split(/\\begin\{itemize\}[^\]]*\]?/);
    const header = parts[0] || '';
    const rawBullets = parts[1] || '';

    const titleMatch = header.match(/\\textbf\{([^}]+)\}/);
    if (!titleMatch) continue;
    const title = cleanLatex(titleMatch[1]);

    const links = [];
    const linkRegex = /\\href\{([^}]+)\}\{\\textit\{\(([^)]+)\)\}\}/g;
    let lMatch;
    while ((lMatch = linkRegex.exec(header)) !== null) {
      links.push({
        url: lMatch[1],
        label: lMatch[2]
      });
    }

    let tech = '';
    const techMatch = header.match(/\\\\?\s*\\textit\{([^}]+)\}/);
    if (techMatch) {
      tech = cleanLatex(techMatch[1]);
    }

    const bullets = [];
    const itemRegex = /\\item\s+([\s\S]*?)(?=\\item|$)/g;
    let bMatch;
    while ((bMatch = itemRegex.exec(rawBullets)) !== null) {
      const cleanBullet = cleanLatex(bMatch[1]);
      if (cleanBullet) {
        bullets.push(cleanBullet);
      }
    }

    projects.push({
      title,
      tech,
      links,
      bullets
    });
  }

  return projects;
}

function parseSkills(tex) {
  const skillsSectionMatch = tex.match(/\\section\{Technical Skills\}([\s\S]*?)(?:\\section\{|$)/);
  if (!skillsSectionMatch) return [];

  const rawSection = skillsSectionMatch[1];
  const categories = [];

  const catRegex = /\\textbf\{([^:]+):\}\{\s*([^}]+)\}/g;
  let match;

  while ((match = catRegex.exec(rawSection)) !== null) {
    const catName = cleanLatex(match[1]);
    const rawSkills = match[2];
    const skillList = rawSkills.split(',').map(s => cleanLatex(s)).filter(Boolean);

    const items = skillList.map(name => {
      const meta = SKILL_METADATA[name] || {
        icon: 'TbCode',
        url: `https://www.google.com/search?q=${encodeURIComponent(name + ' programming')}`,
        color: '#6366F1'
      };
      return {
        name,
        icon: meta.icon,
        url: meta.url,
        color: meta.color
      };
    });

    categories.push({
      name: catName,
      items
    });
  }

  return categories;
}

function parseEducation(tex) {
  const eduSectionMatch = tex.match(/\\section\{Education\}([\s\S]*?)(?:\\section\{|\\end\{document\}|$)/);
  if (!eduSectionMatch) return [];

  const rawSection = eduSectionMatch[1];
  const items = [];

  const subHeadingMatch = rawSection.match(/\\resumeSubheading\s*\{([^}]+)\}\{([^}]+)\}\s*\{([^}]+)\}\{([^}]+)\}/);

  if (subHeadingMatch) {
    const school = cleanLatex(subHeadingMatch[1]);
    const location = cleanLatex(subHeadingMatch[2]);
    const degreeLine = cleanLatex(subHeadingMatch[3]);
    const period = cleanLatex(subHeadingMatch[4]);

    const details = [];
    let degree = 'Bachelor of Technology';
    let field = 'Computer Science';

    if (degreeLine.includes(';')) {
      const parts = degreeLine.split(';');
      const degPart = parts[0].trim();
      const cgpaPart = parts[1].trim();
      if (cgpaPart) details.push(cgpaPart);
      if (degPart.toLowerCase().includes('in')) {
        const dParts = degPart.split(/in\s+/i);
        degree = dParts[0].trim();
        field = dParts[1].trim();
      } else {
        degree = degPart;
      }
    }

    const courseworkMatch = rawSection.match(/\\item\s+\\textbf\{Coursework\}:\s*([\s\S]*?)(?=\\resumeItemListEnd|\\end\{itemize\}|\n\s*\n|$)/);
    if (courseworkMatch) {
      const cleanCoursework = cleanLatex(courseworkMatch[1]);
      const courses = cleanCoursework.split(',').map(c => c.trim()).filter(Boolean);
      details.push(...courses);
    }

    items.push({
      school,
      degree,
      field,
      location,
      period,
      details
    });
  }

  return items;
}

function generateTSFile(exportName, typeAnnotation, data) {
  const typeDef = typeAnnotation ? `${typeAnnotation}\n\n` : '';
  return `${typeDef}export const ${exportName} = ${JSON.stringify(data, null, 2)};\n`;
}

function main() {
  console.log(`[parse-resume-tex] Reading LaTeX file: ${TEX_FILE_PATH}`);

  if (!fs.existsSync(TEX_FILE_PATH)) {
    console.error(`[parse-resume-tex] Error: ${TEX_FILE_PATH} not found.`);
    process.exit(1);
  }

  const texContent = fs.readFileSync(TEX_FILE_PATH, 'utf-8');

  const personalData = parsePersonal(texContent);
  const experienceData = parseExperience(texContent);
  const projectsData = parseProjects(texContent);
  const skillsData = parseSkills(texContent);
  const educationData = parseEducation(texContent);

  console.log(`[parse-resume-tex] Parsed:`);
  console.log(`  - Personal: ${personalData.name} (${personalData.email}, ${personalData.phone})`);
  console.log(`  - Experience: ${experienceData.length} role(s)`);
  console.log(`  - Projects: ${projectsData.length} project(s)`);
  console.log(`  - Skills: ${skillsData.length} category(ies), ${skillsData.reduce((acc, c) => acc + c.items.length, 0)} total skills`);
  console.log(`  - Education: ${educationData.length} entry(ies)`);

  const experienceTypeDef = `export type ExperienceItem = {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};`;

  const projectsTypeDef = `export type ResumeProjectItem = {
  title: string;
  tech: string;
  links: { label: string; url: string }[];
  bullets: string[];
};`;

  const skillsTypeDef = `export type SkillItem = {
  name: string;
  icon: string;
  url: string;
  color: string;
};

export type SkillCategory = {
  name: string;
  items: SkillItem[];
};`;

  const educationTypeDef = `export type EducationItem = {
  school: string;
  degree: string;
  field: string;
  location: string;
  period: string;
  details?: string[];
};`;

  for (const targetDir of TARGET_DIRS) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(path.join(targetDir, 'personal.ts'), generateTSFile('personal', '', personalData), 'utf-8');
    fs.writeFileSync(path.join(targetDir, 'experience.ts'), generateTSFile('experience', experienceTypeDef, experienceData), 'utf-8');
    fs.writeFileSync(path.join(targetDir, 'resume-projects.ts'), generateTSFile('resumeProjects', projectsTypeDef, projectsData), 'utf-8');
    fs.writeFileSync(path.join(targetDir, 'skills.ts'), generateTSFile('skillCategories', skillsTypeDef, skillsData), 'utf-8');
    fs.writeFileSync(path.join(targetDir, 'education.ts'), generateTSFile('education', educationTypeDef, educationData), 'utf-8');

    console.log(`[parse-resume-tex] Wrote content files to: ${targetDir}`);
  }

  console.log(`[parse-resume-tex] Successfully synchronized portfolio content with ${path.basename(TEX_FILE_PATH)}!`);
}

main();
