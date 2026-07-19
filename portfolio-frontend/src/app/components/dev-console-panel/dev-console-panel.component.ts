import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getPersonal, getSkills } from '../../utils/contentLoader';

type LogEntry = {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
};

@Component({
  selector: 'app-dev-console-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dev-console-panel.component.html',
  styleUrls: ['./dev-console-panel.component.css']
})
export class DevConsolePanelComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('consoleEnd') private consoleEndRef!: ElementRef<HTMLDivElement>;
  @ViewChild('cmdInput') private cmdInputRef!: ElementRef<HTMLInputElement>;

  isOpen = false;
  isMinimized = false;
  inputVal = '';
  history: LogEntry[] = [
    { text: 'Parth OS v1.0.0 (Type "help" for commands)', type: 'success' }
  ];
  shownJokes: number[] = [];
  hasOpened = false;

  // Draggable state
  isDragging = false;
  isShrunk = false;
  shrinkSide: 'left' | 'right' | null = null;
  position = { x: -1, y: -1 };
  private dragStart = { x: 0, y: 0, posX: 0, posY: 0, moved: false };

  private keyListener: any;
  private personal = getPersonal();

  constructor(private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.hasOpened = localStorage.getItem('portfolio_console_opened') === 'true';
      this.position = { x: 16, y: window.innerHeight - 76 };

      this.keyListener = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === '`') {
          e.preventDefault();
          this.toggleConsole();
        }
      };
      window.addEventListener('keydown', this.keyListener);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined' && this.keyListener) {
      window.removeEventListener('keydown', this.keyListener);
    }
  }

  ngAfterViewChecked() {
    if (this.isOpen && !this.isMinimized) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    try {
      this.consoleEndRef?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {}
  }

  toggleConsole() {
    this.isOpen = !this.isOpen;
    this.isMinimized = false;
    if (this.isOpen) {
      if (!this.hasOpened) {
        this.hasOpened = true;
        if (typeof window !== 'undefined') {
          localStorage.setItem('portfolio_console_opened', 'true');
        }
      }
      setTimeout(() => this.cmdInputRef?.nativeElement?.focus(), 60);
    }
  }

  minimize() {
    this.isMinimized = !this.isMinimized;
    if (!this.isMinimized) {
      setTimeout(() => this.cmdInputRef?.nativeElement?.focus(), 60);
    }
  }

  maximize() {
    // Toggle between default and expanded height via class — handled in template
    this.isMinimized = false;
    this.isOpen = true;
  }

  // ── Drag (mouse) ──────────────────────────────────────────────────
  onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    this.startDrag(e.clientX, e.clientY);

    const onMove = (me: MouseEvent) => this.drag(me.clientX, me.clientY);
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this.endDrag();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    this.startDrag(t.clientX, t.clientY);

    const onMove = (me: TouchEvent) => { const tt = me.touches[0]; this.drag(tt.clientX, tt.clientY); };
    const onEnd = () => {
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      this.endDrag();
    };
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
  }

  private startDrag(cx: number, cy: number) {
    this.isDragging = true;
    this.dragStart = { x: cx, y: cy, posX: this.position.x, posY: this.position.y, moved: false };
  }

  private drag(cx: number, cy: number) {
    if (!this.isDragging) return;
    const dx = cx - this.dragStart.x;
    const dy = cy - this.dragStart.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.dragStart.moved = true;
    const newX = Math.max(0, Math.min(window.innerWidth - 180, this.dragStart.posX + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - 70, this.dragStart.posY + dy));
    this.position = { x: newX, y: newY };
  }

  private endDrag() {
    this.isDragging = false;
    if (!this.dragStart.moved) {
      this.toggleConsole();
      return;
    }
    const x = this.position.x;
    if (x < 50) {
      this.isShrunk = true;
      this.shrinkSide = 'left';
      this.position = { x: 0, y: this.position.y };
    } else if (x > window.innerWidth - 220) {
      this.isShrunk = true;
      this.shrinkSide = 'right';
      this.position = { x: window.innerWidth - 44, y: this.position.y };
    } else {
      this.isShrunk = false;
      this.shrinkSide = null;
    }
  }

  expand() {
    this.isShrunk = false;
    const side = this.shrinkSide;
    this.shrinkSide = null;
    this.position = { x: side === 'left' ? 16 : window.innerWidth - 220, y: this.position.y };
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window === 'undefined' || this.position.x === -1) return;
    if (this.isShrunk) {
      this.position = {
        x: this.shrinkSide === 'left' ? 0 : window.innerWidth - 44,
        y: Math.min(this.position.y, window.innerHeight - 70)
      };
    } else {
      this.position = {
        x: Math.min(this.position.x, window.innerWidth - 180),
        y: Math.min(this.position.y, window.innerHeight - 70)
      };
    }
  }

  executeCommand(cmdStr: string) {
    const trimmed = cmdStr.trim().toLowerCase();
    if (!trimmed) return;

    const newEntries: LogEntry[] = [{ text: `guest@parthnautiyal:~$ ${cmdStr}`, type: 'input' }];

    switch (trimmed) {
      case 'help':
        newEntries.push(
          { text: 'Available commands:', type: 'success' },
          { text: '  about      - Display bio details', type: 'output' },
          { text: '  skills     - List technical capabilities', type: 'output' },
          { text: '  projects   - Navigate to projects page', type: 'output' },
          { text: '  resume     - Launch interactive resume viewer', type: 'output' },
          { text: '  system     - Open system architecture & pipeline', type: 'output' },
          { text: '  joke       - Print a developer joke', type: 'output' },
          { text: '  sudo       - Elevate privileges', type: 'output' },
          { text: '  clear      - Clear screen logs', type: 'output' }
        );
        break;
      case 'clear':
        this.history = [];
        this.inputVal = '';
        return;
      case 'about':
        newEntries.push(
          { text: `Name: ${this.personal.name}`, type: 'output' },
          { text: `Title: ${this.personal.title}`, type: 'output' },
          { text: `Bio: ${this.personal.summary}`, type: 'output' },
          { text: `GitHub: ${this.personal.github}`, type: 'output' }
        );
        break;
      case 'skills': {
        const skillsFlat = getSkills().flatMap(c => c.items).map(s => s.name).join(', ');
        newEntries.push({ text: `Technical Skills: ${skillsFlat}`, type: 'output' });
        break;
      }
      case 'projects':
        newEntries.push({ text: 'Navigating to /projects...', type: 'success' });
        setTimeout(() => { this.router.navigate(['/projects']); this.isOpen = false; }, 1000);
        break;
      case 'resume':
        newEntries.push({ text: 'Navigating to Resume Section /resume...', type: 'success' });
        setTimeout(() => { this.router.navigate(['/resume']); this.isOpen = false; }, 1000);
        break;
      case 'system':
        newEntries.push({ text: 'Navigating to System Architecture Section /system...', type: 'success' });
        setTimeout(() => { this.router.navigate(['/system']); this.isOpen = false; }, 1000);
        break;
      case 'joke': {
        const jokes = [
          "Why do programmers wear glasses? Because they can't C#.",
          "There are 10 types of people in the world: those who understand binary, and those who don't.",
          "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
          "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?'",
          "Why did the developer go broke? Because he used up all his cache.",
          "I have a joke about recursion... I have a joke about recursion...",
          "A byte walks into a bar looking pale. The bartender asks, 'What's wrong?' Byte: 'Bit flip.'",
          "Why do Java developers wear glasses? Because they don't C++.",
          "!false — it's funny because it's true.",
          "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
          "A QA engineer walks into a bar. Orders 0 beers. Orders 999999999 beers. Orders -1 beers. Orders a lizard. Orders null beers. Orders asdfjkl beers.",
          "What do you call a programmer from Finland? Nerdic.",
          "Git commit -m 'fix' pushed 47 times in a row: works on my machine.",
          "The cloud is just someone else's computer having an existential crisis.",
          "I'd explain Kubernetes to you, but we'd be here until the heat death of the cluster.",
          "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 127 little bugs in the code.",
          "Debugging: removing the needles from a haystack you lit on fire yourself.",
          "Stack Overflow is just programmers paying it forward from their own panic.",
          "There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors.",
          "My code doesn't have bugs. It has undocumented features.",
          "A programmer's spouse asks: 'Go to the store, get a gallon of milk, and if they have eggs, get a dozen.' He comes home with 12 gallons of milk.",
          "Why did the scarecrow win an award? Because he was outstanding in his field... just like my Kubernetes pods.",
          "In Soviet Russia, code reviews you.",
          "I'm not lazy, I'm on energy-saving mode. Like a Lambda on cold start.",
          "Schrodinger's microservice: simultaneously working and not working until someone checks the logs.",
          "The first rule of Kafka club: you do not talk about Kafka. The second rule: you do not understand Kafka.",
          "Spring Boot: because XML configs weren't painful enough.",
          "Temporal workflows: for when your cron job has abandonment issues."
        ];

        const available = jokes.map((_, i) => i).filter(i => !this.shownJokes.includes(i));
        if (available.length === 0) {
          newEntries.push({ text: "⚠️ Humor Buffer Overflow! You've exhausted my entire stand-up routine. (Joke registry reset!)", type: 'error' });
          this.shownJokes = [];
        } else {
          const idx = available[Math.floor(Math.random() * available.length)];
          this.shownJokes = [...this.shownJokes, idx];
          newEntries.push({ text: jokes[idx], type: 'output' });
        }
        break;
      }
      case 'sudo':
        newEntries.push({ text: "❌ Error: guest is not in the sudoers file. This incident will be reported to the sysadmin.", type: 'error' });
        break;
      default:
        newEntries.push({ text: `❌ bash: command not found: ${trimmed}. Type "help" for options.`, type: 'error' });
    }

    this.history = [...this.history, ...newEntries];
    this.inputVal = '';
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.executeCommand(this.inputVal);
  }
}
