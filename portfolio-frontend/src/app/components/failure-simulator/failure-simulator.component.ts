import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { FailureState } from '../../pages/system-architecture-page/system-architecture-page.component';
import { QuestService } from '../../services/quest.service';

@Component({
  selector: 'app-failure-simulator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './failure-simulator.component.html',
  styleUrls: ['./failure-simulator.component.css']
})
export class FailureSimulatorComponent {
  @Input() state!: FailureState;
  @Output() toggle = new EventEmitter<keyof FailureState>();

  constructor(private questService: QuestService) {}

  handleToggle(key: keyof FailureState) {
    this.toggle.emit(key);
    this.questService.unlockAchievement('TRIGGER_CHAOS');
  }
}
