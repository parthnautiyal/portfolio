import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SystemArchitectureCanvasComponent } from '../../components/system-architecture-canvas/system-architecture-canvas.component';
import { FailureSimulatorComponent } from '../../components/failure-simulator/failure-simulator.component';
import { ObservabilityLogsComponent } from '../../components/observability-logs/observability-logs.component';
import { PipelineVisualizerComponent } from '../../components/pipeline-visualizer/pipeline-visualizer.component';

export type FailureState = {
  geminiLimit: boolean;
  gatewayLatency: boolean;
  cloudMountOffline: boolean;
  ollamaOffline: boolean;
};

export type ArchitectureTab = 'topology' | 'sync-engine' | 'pipeline' | 'observability';

@Component({
  selector: 'app-system-architecture-page',
  standalone: true,
  imports: [
    CommonModule,
    SystemArchitectureCanvasComponent,
    FailureSimulatorComponent,
    ObservabilityLogsComponent,
    PipelineVisualizerComponent
  ],
  templateUrl: './system-architecture-page.component.html',
  styleUrls: ['./system-architecture-page.component.css']
})
export class SystemArchitecturePageComponent implements OnInit, OnDestroy {
  activeTab: ArchitectureTab = 'topology';
  selectedNodeId: string = 'overleaf-source';

  failureState: FailureState = {
    geminiLimit: false,
    gatewayLatency: false,
    cloudMountOffline: false,
    ollamaOffline: false
  };

  private routeSub!: Subscription;

  constructor(private route: ActivatedRoute) {}

  get activeFailureCount(): number {
    return Object.values(this.failureState).filter(Boolean).length;
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(params => {
      const selectParam = params['select'];
      if (selectParam) {
        this.failureState = {
          geminiLimit: selectParam === 'gemini',
          gatewayLatency: selectParam === 'latency',
          cloudMountOffline: selectParam === 'cloud',
          ollamaOffline: selectParam === 'ollama'
        };
      }
      const tabParam = params['tab'] as ArchitectureTab;
      if (tabParam && ['topology', 'sync-engine', 'pipeline', 'observability'].includes(tabParam)) {
        this.activeTab = tabParam;
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  setActiveTab(tab: ArchitectureTab) {
    this.activeTab = tab;
  }

  jumpToAstParser() {
    this.activeTab = 'sync-engine';
  }

  jumpToOverleafSync() {
    this.activeTab = 'sync-engine';
  }

  jumpToMultiLlm() {
    this.activeTab = 'topology';
    this.selectedNodeId = 'multi-llm';
  }

  jumpToEdgeAvailability() {
    this.activeTab = 'observability';
  }

  resetSimulations() {
    this.failureState = {
      geminiLimit: false,
      gatewayLatency: false,
      cloudMountOffline: false,
      ollamaOffline: false
    };
  }

  toggleQuickSimulation() {
    if (this.activeFailureCount > 0) {
      this.resetSimulations();
    } else {
      this.failureState.geminiLimit = true;
      this.activeTab = 'topology';
      this.selectedNodeId = 'multi-llm';
    }
  }

  handleToggleFailure(key: keyof FailureState) {
    this.failureState = {
      ...this.failureState,
      [key]: !this.failureState[key]
    };
  }
}
