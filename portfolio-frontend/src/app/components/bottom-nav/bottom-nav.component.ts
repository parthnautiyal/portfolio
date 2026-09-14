import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css']
})
export class BottomNavComponent {
  navItems = [
    { to: '/', label: 'Home', icon: 'home' },
    { to: '/resume', label: 'Resume', icon: 'resume' },
    { to: '/projects', label: 'Projects', icon: 'projects' },
    { to: '/system', label: 'System', icon: 'system' },
    { to: '/chat', label: 'Chat', icon: 'chat' },
  ];

  constructor(private router: Router) {}

  isActive(path: string): boolean {
    if (path === '/') {
      return this.router.url === '/' || this.router.url === '';
    }
    return this.router.url.startsWith(path);
  }
}
