import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef, HostListener, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getPersonal, getSkills, getExperience, getEducation } from '../../utils/contentLoader';
import { QuestService, LEVEL_CLASS_NAMES, ACHIEVEMENTS } from '../../services/quest.service';
import projectsRaw from '../../content/projects.json';

type Seg = { t: string; c: string };

type LogEntry = {
  text?: string;
  segs?: Seg[];
  type: 'input' | 'output' | 'error' | 'success' | 'dim';
};

const ALL_COMMANDS = [
  'about', 'banner', 'cat', 'chat', 'clear', 'contact',
  'edu', 'education', 'exp', 'experience', 'help', 'hist',
  'history', 'joke', 'ls', 'man', 'matrix', 'neofetch',
  'ping', 'projects', 'quest', 'resume', 'skills', 'sudo',
  'system', 'whoami',
].sort();

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
  isMaximized = false;
  inputVal = '';
  history: LogEntry[] = [
    {
      segs: [
        { t: '┌─ ', c: 'text-green-600' },
        { t: 'Parth OS v2.0.0', c: 'text-green-400' },
        { t: ' ── type ', c: 'text-green-600' },
        { t: '"help"', c: 'text-yellow-400' },
        { t: ' for commands ─┐', c: 'text-green-600' },
      ],
      type: 'output'
    }
  ];

  typedHistory: string[] = [];
  historyIndex = -1;
  shownJokes: number[] = [];
  hasOpened = false;

  // Draggable state
  isDragging = false;
  isShrunk = false;
  shrinkSide: 'left' | 'right' | null = null;
  position = { x: -1, y: -1 };
  private dragStart = { x: 0, y: 0, posX: 0, posY: 0, moved: false };
  private _livePos = { x: 0, y: 0 };
  private rafId = 0;
  private keyListener: any;
  private personal = getPersonal();

  @ViewChild('dragPill') private dragPillRef!: ElementRef<HTMLElement>;

  constructor(private router: Router, private questService: QuestService, private ngZone: NgZone) {}

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
    this.isMaximized = !this.isMaximized;
    this.isMinimized = false;
    setTimeout(() => this.cmdInputRef?.nativeElement?.focus(), 60);
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.typedHistory.length > 0) {
        this.historyIndex = Math.min(this.historyIndex + 1, this.typedHistory.length - 1);
        this.inputVal = this.typedHistory[this.typedHistory.length - 1 - this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.inputVal = this.typedHistory[this.typedHistory.length - 1 - this.historyIndex];
      } else {
        this.historyIndex = -1;
        this.inputVal = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.tabComplete();
    }
  }

  tabComplete() {
    const prefix = this.inputVal.trim().toLowerCase();
    if (!prefix) {
      this.history = [...this.history, {
        text: ALL_COMMANDS.join('   '),
        type: 'dim'
      }];
      return;
    }
    const matches = ALL_COMMANDS.filter(cmd => cmd.startsWith(prefix));
    if (matches.length === 1) {
      this.inputVal = matches[0] + ' ';
    } else if (matches.length > 1) {
      this.history = [...this.history,
        {
          segs: [
            { t: 'guest@parth:~$ ', c: 'text-slate-500' },
            { t: this.inputVal, c: 'text-slate-300' }
          ],
          type: 'input'
        },
        { text: matches.join('   '), type: 'dim' }
      ];
    }
  }

  // ── Drag (mouse) ──────────────────────────────────────────────────
  onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    this.startDrag(e.clientX, e.clientY);
    this.ngZone.runOutsideAngular(() => {
      const onMove = (me: MouseEvent) => this.drag(me.clientX, me.clientY);
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        this.ngZone.run(() => this.endDrag());
      };
      document.addEventListener('mousemove', onMove, { passive: true });
      document.addEventListener('mouseup', onUp);
    });
  }

  onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    this.startDrag(t.clientX, t.clientY);
    this.ngZone.runOutsideAngular(() => {
      const onMove = (me: TouchEvent) => { const tt = me.touches[0]; this.drag(tt.clientX, tt.clientY); };
      const onEnd = () => {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        this.ngZone.run(() => this.endDrag());
      };
      document.addEventListener('touchmove', onMove, { passive: true });
      document.addEventListener('touchend', onEnd);
    });
  }

  private startDrag(cx: number, cy: number) {
    this.isDragging = true;
    this.dragStart = { x: cx, y: cy, posX: this.position.x, posY: this.position.y, moved: false };
    this._livePos = { x: this.position.x, y: this.position.y };
    const el = this.dragPillRef?.nativeElement;
    if (el) el.style.willChange = 'left, top';
  }

  private drag(cx: number, cy: number) {
    if (!this.isDragging) return;
    const dx = cx - this.dragStart.x;
    const dy = cy - this.dragStart.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.dragStart.moved = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      const newX = Math.max(0, Math.min(window.innerWidth - 180, this.dragStart.posX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 70, this.dragStart.posY + dy));
      this._livePos = { x: newX, y: newY };
      const el = this.dragPillRef?.nativeElement;
      if (el) {
        el.style.left = newX + 'px';
        el.style.top = newY + 'px';
      }
    });
  }

  private endDrag() {
    cancelAnimationFrame(this.rafId);
    this.isDragging = false;
    const el = this.dragPillRef?.nativeElement;
    if (el) el.style.willChange = '';
    if (!this.dragStart.moved) {
      this.toggleConsole();
      return;
    }
    this.position = { ...this._livePos };
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
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const [cmd, ...args] = lower.split(/\s+/);
    const rawArgs = trimmed.substring(cmd.length).trim();

    if (this.typedHistory[this.typedHistory.length - 1] !== trimmed) {
      this.typedHistory.push(trimmed);
      if (this.typedHistory.length > 50) this.typedHistory.shift();
    }
    this.historyIndex = -1;

    const inputEntry: LogEntry = {
      segs: [
        { t: 'guest@parth:~$ ', c: 'text-slate-500' },
        { t: trimmed, c: 'text-slate-200' }
      ],
      type: 'input'
    };

    let newEntries: LogEntry[] = [inputEntry];

    switch (cmd) {
      case 'help':
        newEntries.push(...this.buildHelp());
        break;
      case 'clear':
        this.history = [];
        this.inputVal = '';
        return;
      case 'whoami':
      case 'about':
        newEntries.push(...this.buildWhoami());
        break;
      case 'neofetch':
        newEntries.push(...this.buildNeofetch());
        break;
      case 'banner':
        newEntries.push(...this.buildBanner());
        break;
      case 'ls':
        newEntries.push(...this.buildLs());
        break;
      case 'cat':
        newEntries.push(...this.buildCat(args[0] || ''));
        break;
      case 'experience':
      case 'exp':
        newEntries.push(...this.buildExperience());
        break;
      case 'skills':
        newEntries.push(...this.buildSkills());
        break;
      case 'education':
      case 'edu':
        newEntries.push(...this.buildEducation());
        break;
      case 'projects':
        newEntries.push({ text: '⬡ Navigating to /projects...', type: 'success' });
        setTimeout(() => { this.router.navigate(['/projects']); this.isOpen = false; }, 800);
        break;
      case 'contact':
        newEntries.push(...this.buildContact());
        break;
      case 'quest':
        newEntries.push(...this.buildQuest());
        break;
      case 'history':
      case 'hist':
        newEntries.push(...this.buildHistoryLog());
        break;
      case 'man':
        newEntries.push(...this.buildMan(args[0] || ''));
        break;
      case 'ping':
        newEntries.push({ segs: [{ t: '  ⬡ Pinging Render backend...', c: 'text-slate-500' }], type: 'dim' });
        this.history = [...this.history, ...newEntries];
        this.inputVal = '';
        this.doPing();
        return;
      case 'chat':
        if (!rawArgs) {
          newEntries.push({ text: '⚠  Usage: chat <message>   —   or visit /chat for the full experience', type: 'error' });
        } else {
          newEntries.push({
            segs: [{ t: '  ⬡ Sending to AI agent...', c: 'text-slate-500' }],
            type: 'dim'
          });
          this.history = [...this.history, ...newEntries];
          this.inputVal = '';
          this.doChat(rawArgs);
          return;
        }
        break;
      case 'matrix':
        newEntries.push(...this.buildMatrix());
        break;
      case 'joke':
        newEntries.push(...this.buildJoke());
        break;
      case 'sudo':
        newEntries.push({ text: '❌ guest is not in the sudoers file. This incident will be reported.', type: 'error' });
        break;
      case 'resume':
        newEntries.push({ text: '⬡ Navigating to /resume...', type: 'success' });
        setTimeout(() => { this.router.navigate(['/resume']); this.isOpen = false; }, 800);
        break;
      case 'system':
        newEntries.push({ text: '⬡ Navigating to /system...', type: 'success' });
        setTimeout(() => { this.router.navigate(['/system']); this.isOpen = false; }, 800);
        break;
      default:
        newEntries.push({
          segs: [
            { t: `bash: ${cmd}: `, c: 'text-red-400' },
            { t: 'command not found', c: 'text-red-400' },
            { t: ' — type ', c: 'text-slate-500' },
            { t: '"help"', c: 'text-yellow-400' },
          ],
          type: 'error'
        });
    }

    this.history = [...this.history, ...newEntries];
    this.inputVal = '';
  }

  private buildHelp(): LogEntry[] {
    return [
      { segs: [{ t: '┌── Navigation ──────────────────────────────────┐', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '  resume', c: 'text-cyan-400' }, { t: '  system', c: 'text-cyan-400' }, { t: '  projects', c: 'text-cyan-400' }, { t: '  chat <msg>', c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '┌── Data ─────────────────────────────────────────┐', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '  whoami', c: 'text-cyan-400' }, { t: '     about     ', c: 'text-slate-500' }, { t: 'neofetch', c: 'text-cyan-400' }, { t: '   banner', c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '  ls', c: 'text-cyan-400' }, { t: '         cat ', c: 'text-cyan-400' }, { t: '<section>', c: 'text-yellow-500' }, { t: '   exp     skills', c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '  education', c: 'text-cyan-400' }, { t: '  contact    ', c: 'text-cyan-400' }, { t: 'quest', c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '┌── Tools ────────────────────────────────────────┐', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '  ping', c: 'text-cyan-400' }, { t: '  man ', c: 'text-cyan-400' }, { t: '<cmd>', c: 'text-yellow-500' }, { t: '  history', c: 'text-cyan-400' }, { t: '  clear', c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '┌── Fun ──────────────────────────────────────────┐', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '  joke', c: 'text-cyan-400' }, { t: '  matrix', c: 'text-cyan-400' }, { t: '  sudo', c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '  ↑↓', c: 'text-yellow-500' }, { t: ' history nav    ', c: 'text-slate-500' }, { t: 'Tab', c: 'text-yellow-500' }, { t: ' autocomplete    ', c: 'text-slate-500' }, { t: 'Ctrl+`', c: 'text-yellow-500' }, { t: ' toggle', c: 'text-slate-500' }], type: 'output' },
    ];
  }

  private buildWhoami(): LogEntry[] {
    const p = this.personal;
    return [
      { segs: [{ t: '┌─ ', c: 'text-green-600' }, { t: p.name, c: 'text-green-300' }, { t: ' ────────────────────────', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '│  Role:     ', c: 'text-slate-500' }, { t: p.title, c: 'text-green-400' }], type: 'output' },
      { segs: [{ t: '│  Location: ', c: 'text-slate-500' }, { t: (p as any).location || 'Bangalore, India', c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '│  GitHub:   ', c: 'text-slate-500' }, { t: p.github, c: 'text-blue-400' }], type: 'output' },
      { segs: [{ t: '│  LinkedIn: ', c: 'text-slate-500' }, { t: p.linkedin, c: 'text-blue-400' }], type: 'output' },
      { text: '', type: 'output' },
      { segs: [{ t: '│  ', c: 'text-slate-600' }, { t: p.summary, c: 'text-green-400/80' }], type: 'output' },
    ];
  }

  private buildNeofetch(): LogEntry[] {
    const p = this.personal;
    const exp = getExperience();
    const level = this.questService.level();
    const xp = this.questService.xp();
    const levelName = LEVEL_CLASS_NAMES[level - 1];
    const latestRole = exp[0]?.role || 'SDE II';
    const latestCompany = exp[0]?.company || 'ZopSmart';
    const topSkills = getSkills().flatMap(c => c.items).slice(0, 5).map(s => s.name).join(' · ');
    const barFill = Math.min(10, Math.floor(xp / 50));
    const bar = '█'.repeat(barFill) + '░'.repeat(10 - barFill);

    const pad = (s: string, n: number) => s.substring(0, n).padEnd(n, ' ');
    const W = 44;

    const row = (label: string, value: string, vc = 'text-cyan-400'): LogEntry => ({
      segs: [
        { t: '│  ', c: 'text-green-700' },
        { t: label, c: 'text-slate-400' },
        { t: value, c: vc },
        { t: pad('', W - label.length - Math.min(value.length, W - label.length)) + ' │', c: 'text-green-700' }
      ],
      type: 'output'
    });

    return [
      { segs: [{ t: '╭' + '─'.repeat(W + 4) + '╮', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '│', c: 'text-green-700' }, { t: '  ' + pad(p.name, W + 2) + ' ', c: 'text-green-300' }, { t: '│', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '│', c: 'text-green-700' }, { t: '  ' + pad(p.title, W + 2) + ' ', c: 'text-slate-500' }, { t: '│', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '├' + '═'.repeat(W + 4) + '┤', c: 'text-green-700' }], type: 'output' },
      row('  OS        ', pad('Angular 21 + Spring Boot', 22)),
      row('  Host      ', pad('Vercel + Render', 22)),
      row('  Location  ', pad((p as any).location || 'Bangalore, India', 22)),
      row('  Role      ', pad(latestRole, 22)),
      row('  Company   ', pad(latestCompany, 22)),
      row('  GitHub    ', pad(p.github.replace('https://', ''), 22), 'text-blue-400'),
      row('  Level     ', pad(`${level} — ${levelName}`, 22), 'text-amber-400'),
      row('  XP        ', pad(`[${bar}] ${xp}/500`, 22), 'text-emerald-400'),
      row('  Stack     ', pad(topSkills, 22), 'text-yellow-400'),
      { segs: [{ t: '╰' + '─'.repeat(W + 4) + '╯', c: 'text-green-700' }], type: 'output' },
    ];
  }

  private buildBanner(): LogEntry[] {
    return [
      { segs: [{ t: '  ██████╗  █████╗ ██████╗ ████████╗██╗  ██╗', c: 'text-green-500' }], type: 'output' },
      { segs: [{ t: '  ██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║  ██║', c: 'text-green-400' }], type: 'output' },
      { segs: [{ t: '  ██████╔╝███████║██████╔╝   ██║   ███████║', c: 'text-green-300' }], type: 'output' },
      { segs: [{ t: '  ██╔═══╝ ██╔══██║██╔══██╗   ██║   ██╔══██║', c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '  ██║     ██║  ██║██║  ██║   ██║   ██║  ██║', c: 'text-cyan-300' }], type: 'output' },
      { segs: [{ t: '  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝', c: 'text-cyan-200' }], type: 'output' },
      { text: '', type: 'output' },
      { segs: [{ t: '  Parth Nautiyal', c: 'text-green-300' }, { t: '  ·  ', c: 'text-slate-600' }, { t: 'Backend Engineer', c: 'text-slate-400' }], type: 'output' },
      { segs: [{ t: '  Building reliable systems at scale.', c: 'text-slate-600' }], type: 'output' },
    ];
  }

  private buildLs(): LogEntry[] {
    return [
      { segs: [
        { t: '  about', c: 'text-cyan-400' }, { t: '      ', c: 'text-slate-700' },
        { t: 'experience', c: 'text-cyan-400' }, { t: '   ', c: 'text-slate-700' },
        { t: 'education', c: 'text-cyan-400' },
      ], type: 'output' },
      { segs: [
        { t: '  skills', c: 'text-cyan-400' }, { t: '     ', c: 'text-slate-700' },
        { t: 'projects', c: 'text-yellow-400' }, { t: '     ', c: 'text-slate-700' },
        { t: 'contact', c: 'text-cyan-400' },
      ], type: 'output' },
      { segs: [
        { t: '  resume', c: 'text-yellow-400' }, { t: '     ', c: 'text-slate-700' },
        { t: 'system', c: 'text-yellow-400' }, { t: '       ', c: 'text-slate-700' },
        { t: 'chat', c: 'text-yellow-400' },
      ], type: 'output' },
      { segs: [{ t: '  cyan', c: 'text-cyan-400' }, { t: ' = data view   ', c: 'text-slate-600' }, { t: 'yellow', c: 'text-yellow-400' }, { t: ' = page navigation', c: 'text-slate-600' }], type: 'dim' },
    ];
  }

  private buildCat(section: string): LogEntry[] {
    switch (section.toLowerCase()) {
      case 'about':
      case 'whoami':
        return this.buildWhoami();
      case 'experience':
      case 'exp':
        return this.buildExperience();
      case 'skills':
        return this.buildSkills();
      case 'education':
      case 'edu':
        return this.buildEducation();
      case 'projects':
        return this.buildProjectsData();
      case 'contact':
        return this.buildContact();
      default:
        if (!section) {
          return [{ text: '⚠  Usage: cat <section>   sections: about  experience  skills  education  projects  contact', type: 'error' }];
        }
        return [{ segs: [{ t: `cat: ${section}: `, c: 'text-red-400' }, { t: 'No such file or directory', c: 'text-red-400' }], type: 'error' }];
    }
  }

  private buildExperience(): LogEntry[] {
    const experience = getExperience();
    const entries: LogEntry[] = [];

    experience.forEach((exp, i) => {
      if (i > 0) entries.push({ text: '', type: 'output' });
      entries.push({
        segs: [
          { t: '  ┌─ ', c: 'text-green-700' },
          { t: exp.role, c: 'text-green-300' },
          { t: ' @ ', c: 'text-slate-600' },
          { t: exp.company, c: 'text-cyan-400' },
        ],
        type: 'output'
      });
      entries.push({
        segs: [
          { t: '  │  ', c: 'text-green-700' },
          { t: exp.period, c: 'text-yellow-400' },
          { t: '  ·  ', c: 'text-slate-700' },
          { t: exp.location, c: 'text-slate-400' },
        ],
        type: 'output'
      });
      exp.bullets.slice(0, 3).forEach(bullet => {
        entries.push({
          segs: [
            { t: '  │  ▸ ', c: 'text-green-700' },
            { t: bullet, c: 'text-green-400' }
          ],
          type: 'output'
        });
      });
      if (exp.bullets.length > 3) {
        entries.push({
          segs: [{ t: `  │    + ${exp.bullets.length - 3} more`, c: 'text-slate-600' }],
          type: 'dim'
        });
      }
    });

    return entries;
  }

  private buildSkills(): LogEntry[] {
    const cats = getSkills();
    const entries: LogEntry[] = [];

    cats.forEach(cat => {
      entries.push({
        segs: [
          { t: '  ┌─ ', c: 'text-green-700' },
          { t: cat.name, c: 'text-green-300' },
        ],
        type: 'output'
      });
      const names = cat.items.map(s => s.name);
      for (let i = 0; i < names.length; i += 5) {
        const chunk = names.slice(i, i + 5);
        entries.push({
          segs: [
            { t: '  │  ', c: 'text-green-700' },
            { t: chunk.join('   '), c: 'text-cyan-400' }
          ],
          type: 'output'
        });
      }
    });

    return entries;
  }

  private buildEducation(): LogEntry[] {
    const edu = getEducation();
    return [
      { segs: [{ t: '  ┌─ Education ─────────────────────', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '  │  ', c: 'text-green-700' }, { t: edu.degree, c: 'text-green-300' }], type: 'output' },
      { segs: [{ t: '  │  ', c: 'text-green-700' }, { t: edu.institution, c: 'text-cyan-400' }], type: 'output' },
      { segs: [
        { t: '  │  ', c: 'text-green-700' },
        { t: edu.period, c: 'text-yellow-400' },
        { t: '   ·   ', c: 'text-slate-700' },
        { t: edu.location, c: 'text-slate-400' }
      ], type: 'output' },
      { segs: [{ t: '  │  CGPA: ', c: 'text-green-700' }, { t: edu.cgpa, c: 'text-green-400' }], type: 'output' },
      { segs: [{ t: '  │  ', c: 'text-green-700' }, { t: edu.coursework.join('  ·  '), c: 'text-slate-400' }], type: 'output' },
    ];
  }

  private buildProjectsData(): LogEntry[] {
    const projects = (projectsRaw as any[]);
    const entries: LogEntry[] = [
      { segs: [{ t: '  ┌─ Projects ─────────────────────', c: 'text-green-700' }], type: 'output' }
    ];

    projects.forEach(p => {
      const stack = (p.stack || []).slice(0, 3).join(' · ');
      entries.push({
        segs: [
          { t: '  │  ▸ ', c: 'text-green-700' },
          { t: p.name, c: 'text-cyan-400' },
          { t: '  ', c: 'text-slate-700' },
          { t: stack ? `[${stack}]` : '', c: 'text-yellow-400' }
        ],
        type: 'output'
      });
      if (p.description) {
        entries.push({
          segs: [
            { t: '  │    ', c: 'text-green-700' },
            { t: p.description.substring(0, 65) + (p.description.length > 65 ? '…' : ''), c: 'text-slate-500' }
          ],
          type: 'dim'
        });
      }
    });

    return entries;
  }

  private buildContact(): LogEntry[] {
    const p = this.personal;
    return [
      { segs: [{ t: '  ┌─ Contact ───────────────────────', c: 'text-green-700' }], type: 'output' },
      { segs: [{ t: '  │  Email    ', c: 'text-slate-500' }, { t: p.email, c: 'text-cyan-400' }], type: 'output' },
      { segs: [{ t: '  │  Phone    ', c: 'text-slate-500' }, { t: p.phone, c: 'text-green-400' }], type: 'output' },
      { segs: [{ t: '  │  GitHub   ', c: 'text-slate-500' }, { t: p.github, c: 'text-blue-400' }], type: 'output' },
      { segs: [{ t: '  │  LinkedIn ', c: 'text-slate-500' }, { t: p.linkedin, c: 'text-blue-400' }], type: 'output' },
      { segs: [{ t: '  │  LeetCode ', c: 'text-slate-500' }, { t: p.leetcode, c: 'text-orange-400' }], type: 'output' },
    ];
  }

  private buildQuest(): LogEntry[] {
    const level = this.questService.level();
    const xp = this.questService.xp();
    const levelName = LEVEL_CLASS_NAMES[level - 1];
    const unlocked = this.questService.unlockedAchievements();
    const barFill = Math.min(10, Math.floor(xp / 50));
    const bar = '█'.repeat(barFill) + '░'.repeat(10 - barFill);

    const entries: LogEntry[] = [
      { segs: [{ t: '  ┌─ Recruiter Quest ──────────────', c: 'text-green-700' }], type: 'output' },
      { segs: [
        { t: '  │  Level  ', c: 'text-slate-500' },
        { t: `${level}`, c: 'text-amber-400' },
        { t: ` — ${levelName}`, c: 'text-amber-300' }
      ], type: 'output' },
      { segs: [
        { t: '  │  XP     ', c: 'text-slate-500' },
        { t: `[${bar}]`, c: 'text-emerald-500' },
        { t: ` ${xp}/500`, c: 'text-emerald-400' }
      ], type: 'output' },
      { segs: [{ t: '  │', c: 'text-green-700' }], type: 'output' },
    ];

    Object.entries(ACHIEVEMENTS).forEach(([key, ach]) => {
      const done = unlocked[key as keyof typeof unlocked];
      entries.push({
        segs: [
          { t: '  │  ', c: 'text-green-700' },
          { t: done ? '✓ ' : '○ ', c: done ? 'text-emerald-400' : 'text-slate-600' },
          { t: ach.title, c: done ? 'text-emerald-300' : 'text-slate-500' },
          { t: `  +${ach.xp}xp`, c: 'text-slate-600' }
        ],
        type: 'output'
      });
    });

    return entries;
  }

  private buildHistoryLog(): LogEntry[] {
    if (this.typedHistory.length === 0) {
      return [{ text: '  (no history)', type: 'dim' }];
    }
    return this.typedHistory.map((cmd, i) => ({
      segs: [
        { t: `  ${String(i + 1).padStart(3, ' ')}  `, c: 'text-slate-600' },
        { t: cmd, c: 'text-green-400' }
      ],
      type: 'output' as const
    }));
  }

  private buildMan(command: string): LogEntry[] {
    const pages: Record<string, string[]> = {
      neofetch:   ['Display full profile in neofetch style.', 'Usage: neofetch'],
      ping:       ['Test backend latency. Cold start may take 30-60s.', 'Usage: ping'],
      chat:       ['Send a message to the AI agent inline.', 'Usage: chat <message>'],
      cat:        ['Display section data inline.', 'Usage: cat <section>', 'Sections: about  experience  skills  education  projects  contact'],
      ls:         ['List available data sections and page links.', 'Usage: ls'],
      exp:        ['Show work experience. Alias: experience.', 'Usage: exp'],
      skills:     ['Show technical skills by category.', 'Usage: skills'],
      edu:        ['Show education. Alias: education.', 'Usage: edu'],
      contact:    ['Show contact information.', 'Usage: contact'],
      quest:      ['Show recruiter quest progress and achievements.', 'Usage: quest'],
      banner:     ['Display ASCII art banner.', 'Usage: banner'],
      matrix:     ['Display Matrix-style character rain.', 'Usage: matrix'],
      history:    ['Show command history. Alias: hist.', 'Usage: history'],
      whoami:     ['Show personal summary. Alias: about.', 'Usage: whoami'],
    };

    const page = pages[command.toLowerCase()];
    if (!page) {
      return [{ segs: [{ t: `No manual entry for ${command || '(no command given)'}`, c: 'text-red-400' }], type: 'error' }];
    }

    return [
      { segs: [{ t: `  MAN: ${command.toUpperCase()}`, c: 'text-green-300' }], type: 'output' },
      ...page.map(line => ({ text: '    ' + line, type: 'dim' as const }))
    ];
  }

  private buildMatrix(): LogEntry[] {
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01ハヒフヘホマミムメモラリルレロワヲン';
    const colors = ['text-green-900', 'text-green-800', 'text-green-700', 'text-green-600', 'text-green-500', 'text-green-400', 'text-green-300'];
    const lines: LogEntry[] = [];

    for (let i = 0; i < 9; i++) {
      let line = '  ';
      for (let j = 0; j < 52; j++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      lines.push({ segs: [{ t: line, c: colors[i % colors.length] }], type: 'output' });
    }

    lines.push({ segs: [{ t: '  Wake up, Neo…', c: 'text-green-400' }], type: 'success' });
    return lines;
  }

  private buildJoke(): LogEntry[] {
    const jokes = [
      "Why do programmers wear glasses? Because they can't C#.",
      "There are 10 types of people: those who understand binary, and those who don't.",
      "How many programmers to change a light bulb? None, that's a hardware problem.",
      "A SQL query walks into a bar and asks two tables, 'Can I join you?'",
      "Why did the developer go broke? He used up all his cache.",
      "I have a joke about recursion… I have a joke about recursion…",
      "A byte walks in looking pale. Bartender: 'What's wrong?' Byte: 'Bit flip.'",
      "!false — it's funny because it's true.",
      "Why was the JS developer sad? He didn't Node how to Express himself.",
      "A QA engineer walks into a bar. Orders 0 beers. Orders 999999999 beers. Orders -1 beers.",
      "Git commit -m 'fix' pushed 47 times in a row: works on my machine.",
      "99 little bugs in the code. Take one down, patch it around. 127 bugs in the code.",
      "Debugging: removing needles from a haystack you lit on fire yourself.",
      "Two hard problems in CS: cache invalidation, naming things, and off-by-one errors.",
      "My code doesn't have bugs. It has undocumented features.",
      "Schrodinger's microservice: simultaneously working and not working until someone checks logs.",
      "The first rule of Kafka club: you do not talk about Kafka.",
      "Spring Boot: because XML configs weren't painful enough.",
      "Temporal workflows: for when your cron job has abandonment issues.",
    ];

    const available = jokes.map((_, i) => i).filter(i => !this.shownJokes.includes(i));
    if (available.length === 0) {
      this.shownJokes = [];
      return [{ text: '⚠ Humor buffer overflow — joke registry reset. Try again.', type: 'error' }];
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    this.shownJokes = [...this.shownJokes, idx];
    return [{ segs: [{ t: '  ', c: 'text-slate-600' }, { t: jokes[idx], c: 'text-green-400' }], type: 'output' }];
  }

  private async doPing() {
    const start = performance.now();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ping', apiProvider: 'gemini' }),
        signal: AbortSignal.timeout(65000)
      });
      const ms = Math.round(performance.now() - start);
      this.history = [...this.history, {
        segs: [
          { t: '  ⬡ ', c: 'text-green-600' },
          { t: 'portfolio-zs63.onrender.com', c: 'text-green-300' },
          { t: '  ', c: 'text-slate-700' },
          { t: `${ms}ms`, c: ms < 2000 ? 'text-emerald-400' : 'text-yellow-400' },
          { t: `  HTTP ${res.status}`, c: res.ok ? 'text-emerald-400' : 'text-red-400' }
        ],
        type: 'output'
      }];
    } catch (e: any) {
      const ms = Math.round(performance.now() - start);
      this.history = [...this.history, {
        segs: [{ t: `  ⬡ ping failed after ${ms}ms — ${e.message}`, c: 'text-red-400' }],
        type: 'error'
      }];
    }
  }

  private async doChat(message: string) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, apiProvider: 'gemini' })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { reply: string };
      const lines = data.reply.split('\n').filter((l: string) => l.trim());
      this.history = [...this.history,
        { segs: [{ t: '  ⬡ AI: ', c: 'text-cyan-400' }], type: 'success' },
        ...lines.slice(0, 12).map((line: string) => ({
          segs: [{ t: '    ' + line.substring(0, 100), c: 'text-green-400' }],
          type: 'output' as const
        })),
        ...(lines.length > 12 ? [{ segs: [{ t: `    … (${lines.length - 12} more lines — visit /chat for full view)`, c: 'text-slate-600' }], type: 'dim' as const }] : [])
      ];
    } catch (e: any) {
      this.history = [...this.history, {
        segs: [{ t: `  ⬡ Chat error: ${e.message}`, c: 'text-red-400' }],
        type: 'error'
      }];
    }
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.executeCommand(this.inputVal);
  }
}
