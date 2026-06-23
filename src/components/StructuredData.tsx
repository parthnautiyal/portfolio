import { Helmet } from 'react-helmet-async'
import { personal } from '../content/personal.ts'

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personal.name,
    jobTitle: personal.title,
    url: 'https://parthnautiyal.com',
    sameAs: [
      personal.linkedin,
      personal.github,
      personal.leetcode,
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bangalore',
      addressCountry: 'IN',
    },
    email: personal.email,
    description: personal.summary,
    knowsAbout: [
      'Java',
      'Spring Boot',
      'Kubernetes',
      'Docker',
      'Microservices',
      'CI/CD',
      'Cloud Computing',
      'DevOps',
      'Backend Development',
    ],
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}
