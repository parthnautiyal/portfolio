export type EducationItem = {
  school: string;
  degree: string;
  field: string;
  location: string;
  period: string;
  details?: string[];
};

export const education = [
  {
    "school": "Lovely Professional University",
    "degree": "Bachelor of Technology",
    "field": "Computer Science",
    "location": "Punjab, India",
    "period": "Jul 2020 – Jun 2024",
    "details": [
      "CGPA: 8.9",
      "Data Structures & Algorithms",
      "Distributed Systems",
      "Cloud Computing",
      "Database Management Systems (DBMS)",
      "Operating Systems",
      "Object Oriented Programming (OOP)"
    ]
  }
];
