import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { getPersonal } from '../../utils/contentLoader';

@Component({
  selector: 'app-structured-data',
  standalone: true,
  template: ''
})
export class StructuredDataComponent implements OnInit {
  constructor(
    private renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    if (typeof window === 'undefined') return;
    const personal = getPersonal();

    const existingScript = this.document.getElementById('structured-data-ld-json');
    if (existingScript) {
      this.renderer.removeChild(this.document.head, existingScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: personal.name,
      jobTitle: personal.title,
      url: 'https://parthnautiyal.com',
      sameAs: [
        personal.linkedin,
        personal.github,
        personal.leetcode
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
    };

    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.setAttribute(script, 'id', 'structured-data-ld-json');
    script.text = JSON.stringify(structuredData);
    this.renderer.appendChild(this.document.head, script);
  }
}
