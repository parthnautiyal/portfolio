import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getExperience } from '../../utils/contentLoader';
import { QuestService } from '../../services/quest.service';

type ExperienceItem = {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent implements OnInit {
  experience: ExperienceItem[] = [];

  sde2Expanded = true;
  sde1Expanded = true;
  internExpanded = true;
  activeSpan: 'SDE-INTERN' | 'SDE-I' | 'SDE-II' | null = null;

  sde2Item?: ExperienceItem;
  sde1Item?: ExperienceItem;
  internItem?: ExperienceItem;

  // Dynamic Career Timeline Metrics
  careerStartDate = new Date(2024, 0, 1);  // Jan 1, 2024
  internEndDate = new Date(2024, 6, 1);    // Jul 1, 2024
  sde1EndDate = new Date(2026, 2, 1);      // Mar 1, 2026
  currentDate = new Date();

  totalDays = 0;
  totalDurationText = '';

  internDays = 0;
  internDurationText = '';
  internWidthPct = 20.0;

  sde1Days = 0;
  sde1DurationText = '';
  sde1WidthPct = 66.7;
  sde1LeftPct = 20.0;

  sde2Days = 0;
  sde2DurationText = '';
  sde2WidthPct = 13.3;
  sde2LeftPct = 86.7;

  jul2025LeftPct = 50.0;

  constructor(private questService: QuestService) {}

  ngOnInit() {
    this.experience = getExperience() as ExperienceItem[];

    this.sde2Item = this.experience.find(item => 
      /\b(ii|2)\b/i.test(item.role) || item.role.includes(' II') || item.role.includes('-2')
    ) || {
      role: 'Software Development Engineer II',
      company: 'ZopSmart',
      location: 'Bangalore, India',
      period: 'Mar 2026 – Present',
      bullets: [
        'Architected and scaled 20+ Spring Boot microservices with event-driven Kafka streaming pipelines, reducing API latency by 50% and optimizing high-throughput data ingestion pipelines.',
        'Refactored distributed workflow orchestration using Temporal, decomposing monolithic logic into 11+ activities; implemented retries, idempotency, and state persistence critical for long-running workflows and multi-step agent pipelines.',
        'Orchestrated asynchronous data processing across 7+ high-volume use cases, enabling parallel execution and increasing pipeline throughput by 40%.',
        'Spearheaded platform-level architectural standards, reducing onboarding friction for new services; mentored engineers and conducted technical sessions on distributed system resilience.'
      ]
    };

    this.sde1Item = this.experience.find(item => 
      (/\b(i|1)\b/i.test(item.role) || item.role.includes(' I ') || item.role.endsWith(' I') || item.role.includes('Engineer I')) &&
      !/\b(ii|2)\b/i.test(item.role) &&
      !item.role.includes(' II') &&
      !item.role.toLowerCase().includes('intern')
    ) || {
      role: 'Software Development Engineer I',
      company: 'ZopSmart',
      location: 'Bangalore, India',
      period: 'Jul 2024 – Mar 2026',
      bullets: [
        'Built 3+ production-grade microservices with automated CI/CD pipelines; reduced build time from 9 to 4 mins via caching and parallelized stages, cutting deployment failures by 90%.',
        'Engineered high-performance backend REST APIs in Spring Boot, handling high concurrency with 99.9% uptime.',
        'Enhanced system observability using Grafana, Prometheus, and Datadog, reducing MTTR and accelerating incident resolution.',
        'Maintained strict software quality standards with 85%+ test coverage using JUnit and Mockito, eliminating vulnerabilities.'
      ]
    };

    this.internItem = this.experience.find(item => 
      item.role.toLowerCase().includes('intern')
    ) || {
      role: 'Software Development Engineer Intern',
      company: 'ZopSmart',
      location: 'Bangalore, India',
      period: 'Jan 2024 – Jul 2024',
      bullets: [
        'Practiced Test-Driven Development (TDD) using JUnit and Mockito, increasing unit validation and test suite coverage by 45%.',
        'Assisted in implementing scalable REST API endpoint controllers, database entity mappings, and local service optimizations.',
        'Collaborated with senior engineers on microservices architecture patterns, Spring Boot best practices, and CI/CD deployment automation.'
      ]
    };

    this.calculateDynamicDurations();
  }

  private calculateDynamicDurations() {
    const now = new Date();
    this.currentDate = now;

    const startCareer = this.careerStartDate.getTime();
    const endIntern = this.internEndDate.getTime();
    const endSde1 = this.sde1EndDate.getTime();
    const nowTime = Math.max(endSde1, now.getTime());

    const totalMs = nowTime - startCareer;
    const internMs = endIntern - startCareer;
    const sde1Ms = endSde1 - endIntern;
    const sde2Ms = nowTime - endSde1;

    const msPerDay = 1000 * 60 * 60 * 24;
    this.totalDays = Math.floor(totalMs / msPerDay);
    this.internDays = Math.floor(internMs / msPerDay);
    this.sde1Days = Math.floor(sde1Ms / msPerDay);
    this.sde2Days = Math.max(1, Math.floor(sde2Ms / msPerDay));

    this.internWidthPct = Math.round((internMs / totalMs) * 1000) / 10;
    this.sde1WidthPct = Math.round((sde1Ms / totalMs) * 1000) / 10;
    this.sde1LeftPct = this.internWidthPct;
    this.sde2WidthPct = Math.round((sde2Ms / totalMs) * 1000) / 10;
    this.sde2LeftPct = Math.round((this.internWidthPct + this.sde1WidthPct) * 10) / 10;

    const jul2025Ms = new Date(2025, 6, 1).getTime() - startCareer;
    this.jul2025LeftPct = Math.round((jul2025Ms / totalMs) * 1000) / 10;

    this.totalDurationText = this.getFormattedDuration(this.careerStartDate, now);
    this.internDurationText = this.getFormattedDuration(this.careerStartDate, this.internEndDate);
    this.sde1DurationText = this.getFormattedDuration(this.internEndDate, this.sde1EndDate);
    this.sde2DurationText = this.getFormattedDuration(this.sde1EndDate, now);
  }

  private getFormattedDuration(start: Date, end: Date): string {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
    }
    if (days > 0 || parts.length === 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    }

    return parts.join(' ');
  }

  scrollToCard(id: 'SDE-INTERN' | 'SDE-I' | 'SDE-II') {
    this.activeSpan = id;
    if (id === 'SDE-II') {
      this.questService.unlockAchievement('EXPAND_PROMOTION');
    }
    
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  triggerPromotionUnlock() {
    this.scrollToCard('SDE-II');
  }
}
