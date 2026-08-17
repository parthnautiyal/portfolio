import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects-page/projects-page.component').then(m => m.ProjectsPageComponent)
  },
  {
    path: 'experience',
    loadComponent: () => import('./pages/experience-page/experience-page.component').then(m => m.ExperiencePageComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact-page/contact-page.component').then(m => m.ContactPageComponent)
  },
  {
    path: 'resume',
    loadComponent: () => import('./pages/resume-viewer-page/resume-viewer-page.component').then(m => m.ResumeViewerPageComponent)
  },
  {
    path: 'system',
    loadComponent: () => import('./pages/system-architecture-page/system-architecture-page.component').then(m => m.SystemArchitecturePageComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat-page/chat-page.component').then(m => m.ChatPageComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/resume-manager-page/resume-manager-page.component').then(m => m.ResumeManagerPageComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent)
  }
];
