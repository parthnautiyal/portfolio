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

  constructor(private questService: QuestService) {}

  ngOnInit() {
    this.experience = getExperience() as ExperienceItem[];

    this.sde2Item = this.experience.find(item => 
      item.role.toLowerCase().includes('ii') || item.role.toLowerCase().includes('-2')
    );
    this.sde1Item = this.experience.find(item => 
      (item.role.toLowerCase().includes('engineer i') || 
       item.role.toLowerCase().includes('sde i') || 
       item.role.includes(' I ')) && 
      !item.role.toLowerCase().includes('intern')
    );
    this.internItem = this.experience.find(item => 
      item.role.toLowerCase().includes('intern')
    );
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
