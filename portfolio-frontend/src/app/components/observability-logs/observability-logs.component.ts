import { Component, Input, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FailureState } from '../../pages/system-architecture-page/system-architecture-page.component';

type LogLine = {
  timestamp: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  traceId: string;
  message: string;
};

@Component({
  selector: 'app-observability-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './observability-logs.component.html',
  styleUrls: ['./observability-logs.component.css']
})
export class ObservabilityLogsComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() failureState!: FailureState;

  @ViewChild('logsContainer') private logsContainerRef!: ElementRef<HTMLDivElement>;

  private intervalId: any;
  private needScroll = false;

  logs: LogLine[] = [
    {
      timestamp: new Date(Date.now() - 10000).toISOString(),
      service: 'local-sync-cli',
      level: 'INFO',
      traceId: 'sys-boot',
      message: 'Running scripts/sync-resume.js: checking local workspace dependencies...'
    },
    {
      timestamp: new Date(Date.now() - 9000).toISOString(),
      service: 'local-sync-cli',
      level: 'INFO',
      traceId: 'sys-boot',
      message: 'Successfully synchronized Parth_Nautiyal_Resume.pdf to public folder.'
    },
    {
      timestamp: new Date(Date.now() - 8000).toISOString(),
      service: 'local-sync-cli',
      level: 'INFO',
      traceId: 'sys-boot',
      message: 'PDF text layer parsed (4321 characters found). Invoking LLM schema generator...'
    },
    {
      timestamp: new Date(Date.now() - 6000).toISOString(),
      service: 'local-sync-cli',
      level: 'INFO',
      traceId: 'sys-boot',
      message: 'Gemini structured JSON output parsed successfully. Wrote content files to src/content/*.ts.'
    },
    {
      timestamp: new Date(Date.now() - 4000).toISOString(),
      service: 'visitor-client',
      level: 'INFO',
      traceId: 'client-init',
      message: 'Angular application bootstrapped. Auto dark-mode preference check complete.'
    },
    {
      timestamp: new Date(Date.now() - 3000).toISOString(),
      service: 'serverless-api',
      level: 'INFO',
      traceId: 'server-init',
      message: 'Spring Boot server environment initialized. Controller mappings complete.'
    }
  ];

  metrics = {
    rps: [0, 0, 1, 0, 2, 0, 1, 0, 1, 1],
    latency: [98, 105, 112, 95, 120, 101, 108, 114, 97, 102],
    storage: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    tokens: [850, 850, 850, 850, 850, 850, 850, 850, 850, 850]
  };

  vitals = {
    fcp: '0.45',
    lcp: '0.92',
    cls: '0.01',
    ttfb: '0.09'
  };

  ngOnInit() {
    this.detectBrowserVitals();
    this.startMetricsSimulation();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  ngAfterViewChecked() {
    if (this.needScroll) {
      this.scrollToBottom();
      this.needScroll = false;
    }
  }

  scrollToBottom() {
    try {
      this.logsContainerRef.nativeElement.scrollTop = this.logsContainerRef.nativeElement.scrollHeight;
    } catch (err) {}
  }

  detectBrowserVitals() {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
        const fcpVal = fcpEntry ? (fcpEntry.startTime / 1000).toFixed(2) : '0.45';

        const navEntries = performance.getEntriesByType('navigation');
        const navEntry = navEntries[0] as PerformanceNavigationTiming;
        const ttfbVal = navEntry ? (navEntry.responseStart / 1000).toFixed(2) : '0.09';

        this.vitals = {
          fcp: fcpVal,
          lcp: (parseFloat(fcpVal) * 1.6).toFixed(2),
          cls: '0.01',
          ttfb: ttfbVal
        };
      } catch (e) {
        // use fallback defaults
      }
    }
  }

  getLocalStorageSize(): number {
    if (typeof window === 'undefined') return 12;
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length + key.length) * 2;
        }
      }
      return Math.max(1, Math.round(total / 102.4) / 10);
    } catch (e) {
      return 12;
    }
  }

  startMetricsSimulation() {
    this.intervalId = setInterval(() => {
      const currentStorageSize = this.getLocalStorageSize();

      const updateArray = (arr: number[], min: number, max: number, failFactor = 1) => {
        const nextVal = Math.round((min + Math.random() * (max - min)) * failFactor);
        return [...arr.slice(1), Math.max(0, nextVal)];
      };

      let baseLatency = 100;
      let latencyMultiplier = 1;
      
      if (this.failureState?.gatewayLatency) {
        baseLatency = 10000;
        latencyMultiplier = 1.05;
      }

      const nextLatency = updateArray(this.metrics.latency, baseLatency - 15, baseLatency + 20, latencyMultiplier);
      const nextRps = updateArray(this.metrics.rps, 0, 3);
      const nextTokens = updateArray(this.metrics.tokens, 800, 950);

      this.metrics = {
        rps: nextRps,
        latency: nextLatency,
        storage: [...this.metrics.storage.slice(1), currentStorageSize],
        tokens: nextTokens
      };

      // Random background events
      if (Math.random() > 0.7) {
        const events = [
          { service: 'visitor-client', message: 'Visitor page view tracking successfully posted to Analytics.' },
          { service: 'serverless-api', message: 'GET /api/github - status: 200 OK (cache HIT at edge).' },
          { service: 'visitor-client', message: `Theme synchronization check completed. Mode active: ${typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'}` },
          { service: 'local-sync-cli', message: 'Cron verification: local resume sync hash is identical to Git repository. No recompilation needed.' }
        ];

        if (this.failureState?.geminiLimit && Math.random() > 0.4) {
          events.push({
            service: 'gemini-service',
            message: 'Google Gemini API quota limit warning: Server returned code 429 (Resource Exhausted).'
          });
        }
        if (this.failureState?.gatewayLatency && Math.random() > 0.4) {
          events.push({
            service: 'serverless-api',
            message: 'Slow Execution Alert: serverless execution threshold exceeded (limit: 5000ms).'
          });
        }
        if (this.failureState?.cloudMountOffline && Math.random() > 0.4) {
          events.push({
            service: 'local-sync-cli',
            message: 'iCloud Storage synchronization skipped: directory mount not found at "~/Library/Mobile Documents/com~apple~CloudDocs".'
          });
        }
        if (this.failureState?.ollamaOffline && Math.random() > 0.4) {
          events.push({
            service: 'ollama-fallback',
            message: 'Failed to establish socket connection to localhost:11434 (Connection Refused).'
          });
        }

        const selectedEvent = events[Math.floor(Math.random() * events.length)];
        
        this.logs = [
          ...this.logs.slice(-90),
          {
            timestamp: new Date().toISOString(),
            service: selectedEvent.service,
            level: selectedEvent.message.toLowerCase().includes('error') || selectedEvent.message.toLowerCase().includes('refused')
              ? 'ERROR' 
              : selectedEvent.message.toLowerCase().includes('warning') || selectedEvent.message.toLowerCase().includes('skipped') || selectedEvent.message.toLowerCase().includes('slow')
              ? 'WARN' 
              : 'INFO',
            traceId: 'sys-pulse',
            message: selectedEvent.message
          }
        ];
        this.needScroll = true;
      }
    }, 1500);
  }

  drawSparkline(data: number[], width: number, height: number): string {
    if (data.length < 2) return '';
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data, 1);
    const delta = maxVal - minVal || 1;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - minVal) / delta) * (height - 8) - 4;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  triggerTransaction() {
    const id = 'tr-' + Math.random().toString(36).substring(2, 10);
    const time = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

    const newLogs: LogLine[] = [];

    newLogs.push({
      timestamp: time(0),
      service: 'visitor-client',
      level: 'INFO',
      traceId: id,
      message: 'POST /api/chat - query: "Tell me about Parth\'s skills and professional highlights."'
    });

    newLogs.push({
      timestamp: time(20),
      service: 'serverless-api',
      level: 'INFO',
      traceId: id,
      message: 'Serverless Handler: forwarding payload to Gemini with localized RAG context.'
    });

    if (this.failureState?.gatewayLatency) {
      newLogs.push({
        timestamp: time(120),
        service: 'serverless-api',
        level: 'WARN',
        traceId: id,
        message: 'Network Gateway warning: connection speed throttled (Latency simulated at 10s).'
      });
    }

    if (this.failureState?.geminiLimit) {
      newLogs.push(
        {
          timestamp: time(150),
          service: 'gemini-service',
          level: 'ERROR',
          traceId: id,
          message: 'Gemini endpoint failed: HTTP/1.1 429 Rate Limit Exceeded.'
        },
        {
          timestamp: time(160),
          service: 'serverless-api',
          level: 'INFO',
          traceId: id,
          message: 'Active Redirection: switching routing parameters to Local Ollama Fallback (⑧)...'
        }
      );

      if (this.failureState?.ollamaOffline) {
        newLogs.push(
          {
            timestamp: time(250),
            service: 'ollama-fallback',
            message: 'Failed to invoke Ollama offline API: Server at http://localhost:11434 is offline.',
            level: 'ERROR',
            traceId: id
          },
          {
            timestamp: time(260),
            service: 'serverless-api',
            message: 'All API routes exhausted. Retrieving static pre-compiled profile reply from static storage.',
            level: 'WARN',
            traceId: id
          }
        );
      } else {
        newLogs.push({
          timestamp: time(480),
          service: 'ollama-fallback',
          message: 'Ollama engine (llama3) successfully generated query context. Response stream parsed.',
          level: 'INFO',
          traceId: id
        });
      }
    } else {
      newLogs.push({
        timestamp: time(180),
        service: 'gemini-service',
        level: 'INFO',
        traceId: id,
        message: 'Google Gemini 2.5 Flash response compiled successfully (tokens processed: 1184).'
      });
    }

    newLogs.push({
      timestamp: time(this.failureState?.gatewayLatency ? 10050 : 250),
      service: 'serverless-api',
      level: 'INFO',
      traceId: id,
      message: `POST /api/chat - response 200 OK (${this.failureState?.gatewayLatency ? '10045ms' : '230ms'})`
    });

    newLogs.push({
      timestamp: time(this.failureState?.gatewayLatency ? 10070 : 270),
      service: 'visitor-client',
      level: 'INFO',
      traceId: id,
      message: 'Chat Console: successfully rendered markdown response layout.'
    });

    this.logs = [...this.logs, ...newLogs];
    this.needScroll = true;
  }

  getLatestVal(arr: number[]): number {
    return arr[arr.length - 1];
  }
}
