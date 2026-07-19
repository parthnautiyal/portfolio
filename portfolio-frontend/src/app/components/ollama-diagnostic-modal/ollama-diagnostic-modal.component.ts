import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ollama-diagnostic-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ollama-diagnostic-modal.component.html',
  styleUrls: ['./ollama-diagnostic-modal.component.css']
})
export class OllamaDiagnosticModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  currentOllamaUrl = 'http://localhost:11434';
  currentOllamaModel = 'llama3';

  activeTab: 'cloud' | 'local' = 'cloud';
  pingStatus: 'idle' | 'checking' | 'connected' | 'failed' = 'idle';
  errorMessage = '';
  availableModels: string[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      if (typeof window !== 'undefined') {
        this.currentOllamaUrl = localStorage.getItem('portfolio_ollama_url') || 'http://localhost:11434';
        this.currentOllamaModel = localStorage.getItem('portfolio_ollama_model') || 'llama3';
      }
      this.testConnection();
    }
  }

  onClose() {
    this.close.emit();
  }

  stopPropagation(e: Event) {
    e.stopPropagation();
  }

  async testConnection() {
    this.pingStatus = 'checking';
    this.errorMessage = '';
    this.availableModels = [];

    try {
      const response = await fetch(`${this.currentOllamaUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const models = data.models ? data.models.map((m: any) => m.name) : [];
      this.availableModels = models;
      this.pingStatus = 'connected';
    } catch (err: any) {
      this.pingStatus = 'failed';
      this.errorMessage = err.message === 'Failed to fetch'
        ? 'Could not connect. This usually means Ollama is not running, or CORS origins are not configured.'
        : err.message;
    }
  }

  setActiveTab(tab: 'cloud' | 'local') {
    this.activeTab = tab;
  }
}
