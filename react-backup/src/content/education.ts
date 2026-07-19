export type EducationItem = {
  school: string
  degree: string
  field: string
  location: string
  period: string
  details?: string[]
}

export const education: EducationItem[] = [
  {
    "school": "Lovely Professional University",
    "degree": "Bachelor of Technology",
    "field": "Computer Science",
    "location": "Jalandhar, India",
    "period": "Jul 2020 – Jun 2024",
    "details": [
      "CGPA: 8.9",
      "Data Structures & Algorithms",
      "Operating Systems",
      "Cloud Computing",
      "Database Management Systems",
      "Object Oriented Programming"
    ]
  }
]
