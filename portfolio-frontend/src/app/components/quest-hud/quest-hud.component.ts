import { Component, OnInit, OnDestroy, HostListener, signal, computed, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestService, AchievementKey, ACHIEVEMENTS, QuestToast } from '../../services/quest.service';

const achievementLinks: Record<AchievementKey, string> = {
  LAND_ON_PORTFOLIO: '/',
  VIEW_RESUME: '/resume',
  FULLSCREEN_PDF: '/resume',
  TRIGGER_CHAOS: '/system',
  CHAT_QUERY: '/chat',
  EXPAND_PROMOTION: '/experience',
};

@Component({
  selector: 'app-quest-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-hud.component.html',
  styleUrls: ['./quest-hud.component.css']
})
export class QuestHudComponent implements OnInit, OnDestroy {
  isOpen = false;
  isDragging = false;
  isShrunk = false;
  shrinkSide: 'left' | 'right' | null = null;
  hasOpened = false;

  // Floating coordinates
  position = { x: -1, y: -1 };

  private dragStart = { x: 0, y: 0, posX: 0, posY: 0, moved: false };
  private _livePos = { x: 0, y: 0 };
  private rafId = 0;

  @ViewChild('dragPill') private dragPillRef!: ElementRef<HTMLElement>;

  // Circular progress config
  radius = 18;
  stroke = 3;
  
  get normalizedRadius(): number {
    return this.radius - this.stroke * 2;
  }
  
  get circumference(): number {
    return this.normalizedRadius * 2 * Math.PI;
  }

  get strokeDashoffset(): number {
    const xpVal = this.questService.xp();
    return this.circumference - (Math.min(xpVal, 499) / 500) * this.circumference;
  }

  LEVEL_CLASS_NAMES = [
    'Novice Reviewer',
    'Observer',
    'Reliability Inspector',
    'Systems Analyst',
    'Lead System Evaluator',
  ];

  achievementKeys: AchievementKey[] = [
    'LAND_ON_PORTFOLIO',
    'VIEW_RESUME',
    'FULLSCREEN_PDF',
    'TRIGGER_CHAOS',
    'CHAT_QUERY',
    'EXPAND_PROMOTION'
  ];

  achievementsData = ACHIEVEMENTS;

  constructor(public questService: QuestService, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.hasOpened = localStorage.getItem('portfolio_quest_opened') === 'true';
      this.position = { x: window.innerWidth - 200, y: window.innerHeight - 76 };
    }
  }

  ngOnDestroy() {}

  get unlockedCount(): number {
    const unlocked = this.questService.unlockedAchievements();
    return Object.values(unlocked).filter(Boolean).length;
  }

  get totalAchievements(): number {
    return this.achievementKeys.length;
  }

  // Draggable logic for Mouse
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

  // Draggable logic for Touch
  onTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    this.startDrag(touch.clientX, touch.clientY);
    this.ngZone.runOutsideAngular(() => {
      const onMove = (me: TouchEvent) => { const t = me.touches[0]; this.drag(t.clientX, t.clientY); };
      const onEnd = () => {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        this.ngZone.run(() => this.endDrag());
      };
      document.addEventListener('touchmove', onMove, { passive: true });
      document.addEventListener('touchend', onEnd);
    });
  }

  private startDrag(clientX: number, clientY: number) {
    this.isDragging = true;
    const posX = this.position.x !== -1 ? this.position.x : window.innerWidth - 200;
    const posY = this.position.y !== -1 ? this.position.y : window.innerHeight - 76;
    this.dragStart = { x: clientX, y: clientY, posX, posY, moved: false };
    this._livePos = { x: posX, y: posY };
    const el = this.dragPillRef?.nativeElement;
    if (el) el.style.willChange = 'left, top';
  }

  private drag(clientX: number, clientY: number) {
    if (!this.isDragging) return;
    const dx = clientX - this.dragStart.x;
    const dy = clientY - this.dragStart.y;
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
      this.toggleOpen();
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

  toggleOpen() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && !this.hasOpened) {
      this.hasOpened = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolio_quest_opened', 'true');
      }
    }
  }

  expand() {
    this.isShrunk = false;
    this.shrinkSide = null;
    if (typeof window !== 'undefined') {
      if (this.shrinkSide === 'left') {
        this.position = { x: 32, y: this.position.y };
      } else {
        this.position = { x: window.innerWidth - 220, y: this.position.y };
      }
    }
  }

  handleAchievementClick(key: AchievementKey) {
    const target = achievementLinks[key];
    if (target) {
      this.router.navigateByUrl(target);
      this.isOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window === 'undefined') return;
    if (this.position.x !== -1) {
      if (this.isShrunk) {
        if (this.shrinkSide === 'left') {
          this.position = { x: 0, y: Math.min(this.position.y, window.innerHeight - 70) };
        } else {
          this.position = { x: window.innerWidth - 44, y: Math.min(this.position.y, window.innerHeight - 70) };
        }
      } else {
        const newX = Math.min(this.position.x, window.innerWidth - 190);
        const newY = Math.min(this.position.y, window.innerHeight - 70);
        this.position = { x: newX, y: newY };
      }
    }
  }

  confirmReset() {
    if (typeof window !== 'undefined') {
      if (window.confirm('Reset all achievements and level back to Lvl 1?')) {
        this.questService.resetQuests();
      }
    }
  }
}
