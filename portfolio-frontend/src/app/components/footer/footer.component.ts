import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getPersonal } from '../../utils/contentLoader';
import { trackLinkClick } from '../../utils/analytics';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  personal = getPersonal();
  currentYear = new Date().getFullYear();

  onLinkClick(name: string, url: string) {
    trackLinkClick(name, url);
  }
}
