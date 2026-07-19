import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getPersonal } from '../../utils/contentLoader';

type Highlight = {
  label: string;
  value: string;
  color: string;
  explanation: string;
};

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  personal = getPersonal();
  expanded: string | null = null;
  isClosing = false;
  clickCoords = { x: 0, y: 0 };

  highlights: Highlight[] = [
    {
      label: 'API latency reduction',
      value: '50%+',
      color: 'text-blue-500',
      explanation: 'Profiled 25+ Spring Boot REST endpoints with Datadog APM and identified N+1 query patterns and synchronous blocking calls. Replaced with async processing, strategic DB indexing, and response caching. P95 latency dropped from ~80ms to <40ms across the ZopSmart platform.',
    },
    {
      label: 'Rollback reduction',
      value: '70%',
      color: 'text-green-500',
      explanation: 'Built automated CI/CD pipelines in Jenkins with mandatory integration test gates, blue-green deployments, and pre-cutover smoke tests. Kubernetes Helm rollback policies enabled automatic recovery from failed releases within seconds instead of requiring manual intervention.',
    },
    {
      label: 'Uptime achieved',
      value: '99.9%',
      color: 'text-purple-500',
      explanation: 'Deployed microservices across a Kubernetes cluster with Horizontal Pod Autoscaler (HPA), liveness/readiness probes, and circuit breakers (Resilience4j). Multi-replica deployments with zero-downtime rolling updates eliminated single points of failure across critical Spring Boot services.',
    },
    {
      label: 'MTTR reduction',
      value: '40%',
      color: 'text-orange-500',
      explanation: 'Unified Grafana dashboards correlating Prometheus metrics with Datadog APM traces. Automated alert rules reduced mean time to detect (MTTD) from ~30 minutes to under 5 minutes. Runbooks and structured incident playbooks cut resolution time by an additional 40%.',
    },
  ];

  ngOnInit() {}

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('overflow-hidden');
    }
  }

  handleOpen(label: string, event: MouseEvent) {
    if (typeof window === 'undefined') return;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    this.clickCoords = {
      x: cardCenterX - viewportCenterX,
      y: cardCenterY - viewportCenterY,
    };
    
    this.isClosing = false;
    this.expanded = label;
    document.body.classList.add('overflow-hidden');
  }

  handleClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.expanded = null;
      this.isClosing = false;
      if (typeof document !== 'undefined') {
        document.body.classList.remove('overflow-hidden');
      }
    }, 280);
  }

  getSelectedHighlight(): Highlight | undefined {
    return this.highlights.find(h => h.label === this.expanded);
  }
}
