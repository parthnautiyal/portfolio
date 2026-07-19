import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-icon.component.html',
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class SkillIconComponent {
  @Input() icon = '';
  @Input() color = 'currentColor';
  @Input() size = 16;
}
