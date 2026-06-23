import fs from 'fs';
import path from 'path';
import os from 'os';
import pdf from 'pdf-parse/lib/pdf-parse.js';

// Setup paths
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(__dirname, '../../');
const resumeSrcPath = path.join(rootDir, 'Parth_Nautiyal_Resume.pdf');
const publicDestPath = path.join(rootDir, 'portfolio-frontend/public/Parth_Nautiyal_Resume.pdf');
const contentDir = path.join(rootDir, 'portfolio-frontend/src/content');

async function syncAndParse() {
  console.log('🚀 Starting Resume Sync & Parser...');
  
  if (!fs.existsSync(resumeSrcPath)) {
    console.error(`❌ Error: Resume not found at ${resumeSrcPath}`);
    process.exit(1);
  }

  // 1. Copy to Public Directory
  console.log('📁 Copying PDF to public assets...');
  fs.copyFileSync(resumeSrcPath, publicDestPath);
  console.log('✅ PDF copied to public/Parth_Nautiyal_Resume.pdf');

  // 2. Local iCloud Sync
  const icloudBase = path.join(os.homedir(), 'Library/Mobile Documents/com~apple~CloudDocs');
  if (fs.existsSync(icloudBase)) {
    const icloudDestDir = path.join(icloudBase, 'Resume');
    if (!fs.existsSync(icloudDestDir)) {
      fs.mkdirSync(icloudDestDir, { recursive: true });
    }
    const icloudDestPath = path.join(icloudDestDir, 'Parth_Nautiyal_Resume.pdf');
    fs.copyFileSync(resumeSrcPath, icloudDestPath);
    console.log(`✅ Synced resume to iCloud Drive: ${icloudDestPath}`);
  } else {
    console.log('ℹ️ iCloud Drive not detected or not running macOS. Skipping iCloud sync.');
  }

  // 3. Local Google Drive Sync
  const cloudStoragePath = path.join(os.homedir(), 'Library/CloudStorage');
  let gdriveSynced = false;
  if (fs.existsSync(cloudStoragePath)) {
    try {
      const folders = fs.readdirSync(cloudStoragePath);
      const gdriveFolder = folders.find(f => f.toLowerCase().includes('googledrive'));
      if (gdriveFolder) {
        const gdriveDestDir = path.join(cloudStoragePath, gdriveFolder, 'My Drive', 'Resume');
        if (!fs.existsSync(gdriveDestDir)) {
          fs.mkdirSync(gdriveDestDir, { recursive: true });
        }
        const gdriveDestPath = path.join(gdriveDestDir, 'Parth_Nautiyal_Resume.pdf');
        fs.copyFileSync(resumeSrcPath, gdriveDestPath);
        console.log(`✅ Synced resume to Google Drive: ${gdriveDestPath}`);
        gdriveSynced = true;
      }
    } catch (e) {
      console.warn('⚠️ Scan for Google Drive mounted folder failed:', e.message);
    }
  }
  
  if (!gdriveSynced) {
    console.log('ℹ️ Local Google Drive mount folder not detected. Skipping Google Drive local sync.');
  }

  // 4. Parse PDF using LLM
  console.log('🔍 Extracting text from PDF...');
  const dataBuffer = fs.readFileSync(resumeSrcPath);
  
  let pdfText = '';
  try {
    const parsedPdf = await pdf(dataBuffer);
    pdfText = parsedPdf.text;
  } catch (err) {
    console.error('❌ Failed to read PDF file:', err.message);
    process.exit(1);
  }

  if (!pdfText || pdfText.trim().length === 0) {
    console.error('❌ Extracted text is empty.');
    process.exit(1);
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    console.warn('⚠️ Warning: No GEMINI_API_KEY or OPENAI_API_KEY found in your environment variables.');
    console.warn('   Local file syncing completed, but website content was NOT parsed.');
    console.warn('   To parse and update content, run: GEMINI_API_KEY=your_key npm run sync-resume');
    return;
  }

  console.log('🤖 Contacting AI to parse resume...');
  
  const systemPrompt = `
You are a highly precise resume parser. You will convert the provided raw resume text of Parth Nautiyal into structured JSON matching this exact schema:

{
  "personal": {
    "name": "Parth Nautiyal",
    "title": "Full-Stack Engineer",
    "summary": "Brief summary...",
    "email": "parthnautiyal2002@gmail.com",
    "phone": "7453886885",
    "github": "https://github.com/parthnautiyal",
    "linkedin": "https://www.linkedin.com/in/parth-nautiyal/",
    "leetcode": "https://leetcode.com/u/parth_nautiyal/",
    "resumeUrl": "/Parth_Nautiyal_Resume.pdf"
  },
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "period": "Start - End",
      "bullets": [
        "Responsibility bullet 1",
        "Responsibility bullet 2"
      ]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree (e.g. B.Tech)",
      "field": "Field of Study (e.g. Computer Science)",
      "location": "City, Country",
      "period": "Start - End",
      "details": ["GPA/CGPA", "Activities/Honors"]
    }
  ],
  "skills": [
    {
      "name": "Skill Name (e.g. React)",
      "category": "frontend" | "backend" | "devops" | "tools"
    }
  ],
  "certifications": [
    {
      "name": "Certificate Name",
      "issuer": "Issuing Body",
      "date": "Date Earned",
      "url": "Optional Certificate Link"
    }
  ]
}

Ensure:
1. Every experience bullet is grammatical, professional, and reflects Parth's achievements.
2. Skills are categorized accurately:
   - "frontend": React, HTML, CSS, JavaScript, TypeScript, Angular, Tailwind, etc.
   - "backend": Java, Spring Boot, Microservices, Kafka, SQL, Databases, Temporal, etc.
   - "devops": Docker, Kubernetes, Jenkins, Ansible, AWS, CI/CD, Helm, Prometheus, Grafana, Datadog, etc.
   - "tools": Git, Maven, npm, postman, IntelliJ, Jira, etc.
3. Return ONLY a single valid JSON block. Do not wrap in markdown \`\`\`json tags. Do not write any conversational text.
  `;

  let jsonText = '';
  
  try {
    if (geminiKey) {
      console.log('✨ Using Google Gemini API (gemini-2.5-flash)...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nResume Text:\n${pdfText}` }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      jsonText = result.candidates[0].content.parts[0].text;
    } else {
      console.log('✨ Using OpenAI API (gpt-4o-mini)...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a precise JSON extractor.' },
            { role: 'user', content: `${systemPrompt}\n\nResume Text:\n${pdfText}` }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      jsonText = result.choices[0].message.content;
    }

    console.log('✅ Parsed successfully. Writing changes to source code...');
    const parsedData = JSON.parse(jsonText.trim());

    // 5. Write files
    writeTSFile('personal.ts', 'personal', parsedData.personal);
    writeTSFile('experience.ts', 'experience', parsedData.experience, 'ExperienceItem[]');
    writeTSFile('education.ts', 'education', parsedData.education, 'EducationItem[]');
    writeTSFile('skills.ts', 'skills', parsedData.skills, 'Skill[]');
    writeTSFile('certifications.ts', 'certifications', parsedData.certifications, 'Certification[]');

    console.log('🎉 Website content updated successfully from PDF!');
  } catch (error) {
    console.error('❌ Failed to contact LLM or write files:', error.message);
    process.exit(1);
  }
}

function writeTSFile(filename, variableName, data, typeDeclaration = '') {
  const filePath = path.join(contentDir, filename);
  
  // We need to inject imports or type definitions if needed
  let content = '';
  if (filename === 'experience.ts') {
    content += `export type ExperienceItem = {\n  role: string\n  company: string\n  location: string\n  period: string\n  bullets: string[]\n}\n\n`;
  } else if (filename === 'education.ts') {
    content += `export type EducationItem = {\n  school: string\n  degree: string\n  field: string\n  location: string\n  period: string\n  details?: string[]\n}\n\n`;
  } else if (filename === 'skills.ts') {
    content += `export type Skill = {\n  name: string\n  category: 'frontend' | 'backend' | 'devops' | 'tools'\n}\n\n`;
  } else if (filename === 'certifications.ts') {
    content += `export type Certification = {\n  name: string\n  issuer: string\n  date: string\n  url?: string\n}\n\n`;
  }

  content += `export const ${variableName}${typeDeclaration ? `: ${typeDeclaration}` : ''} = ${JSON.stringify(data, null, 2)}\n`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`   📝 Updated src/content/${filename}`);
}

syncAndParse();
