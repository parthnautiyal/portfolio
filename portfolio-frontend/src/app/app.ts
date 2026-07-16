import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { DevConsolePanelComponent } from './components/dev-console-panel/dev-console-panel.component';
import { QuestHudComponent } from './components/quest-hud/quest-hud.component';
import { StructuredDataComponent } from './components/structured-data/structured-data.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    DevConsolePanelComponent,
    QuestHudComponent,
    StructuredDataComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('portfolio-frontend');
}
