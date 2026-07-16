import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getSkills } from '../../utils/contentLoader';
import { SkillIconComponent } from '../../components/skill-icon/skill-icon.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, SkillIconComponent],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  skillCategories = getSkills();

  ngOnInit() {
    // Reload dynamically on load in case localStorage updates
    this.skillCategories = getSkills();
  }
}
