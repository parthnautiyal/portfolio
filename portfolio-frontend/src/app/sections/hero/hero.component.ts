import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { getPersonal } from '../../utils/contentLoader';
import { trackLinkClick } from '../../utils/analytics';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {
  personal = getPersonal();

  onLinkClick(name: string, url: string) {
    trackLinkClick(name, url);
  }
}
