import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuestService, AchievementKey, ACHIEVEMENTS } from '../../services/quest.service';

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
  isShrunk = true;
  shrinkSide: 'left' | 'right' = 'right';
  isMobile = false;
  hasOpened = false;

  // Edge tab coordinates
  position = { x: 0, y: typeof window !== 'undefined' ? Math.floor(window.innerHeight * 0.52) : 400 };

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

  @ViewChild('edgeTab') edgeTabRef?: ElementRef<HTMLButtonElement>;

  constructor(
    public questService: QuestService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
      this.hasOpened = localStorage.getItem('portfolio_quest_opened') === 'true';
      this.isShrunk = true;
      this.shrinkSide = 'right';
      this.position = { x: 0, y: Math.floor(window.innerHeight * 0.52) };
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

  private dragStartY = 0;
  private dragStartPosY = 0;
  private dragMoved = false;
  private currentDragY = 0;
  private dragRaf = 0;

  onTabMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    this.startDrag(e.clientY);

    const onMove = (me: MouseEvent) => {
      this.handleDragMove(me.clientY);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      this.finishDrag();
    };

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseup', onUp);
    });
  }

  onTabTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    this.startDrag(touch.clientY);

    const onMove = (te: TouchEvent) => {
      if (te.cancelable) te.preventDefault();
      this.handleDragMove(te.touches[0].clientY);
    };

    const onEnd = (te: TouchEvent) => {
      if (!this.dragMoved && te.cancelable) {
        te.preventDefault();
      }
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
      this.finishDrag();
    };

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
      window.addEventListener('touchcancel', onEnd);
    });
  }

  private startDrag(clientY: number) {
    this.dragStartY = clientY;
    this.dragStartPosY = this.position.y;
    this.currentDragY = this.position.y;
    this.dragMoved = false;
    const btn = this.edgeTabRef?.nativeElement;
    if (btn) {
      btn.style.willChange = 'top';
      btn.style.transition = 'none';
    }
  }

  private handleDragMove(clientY: number) {
    const dy = clientY - this.dragStartY;
    if (Math.abs(dy) > 4) {
      this.dragMoved = true;
    }
    if (this.dragMoved) {
      const newY = Math.max(60, Math.min(window.innerHeight - 70, this.dragStartPosY + dy));
      this.currentDragY = newY;
      cancelAnimationFrame(this.dragRaf);
      this.dragRaf = requestAnimationFrame(() => {
        const btn = this.edgeTabRef?.nativeElement;
        if (btn) {
          btn.style.top = `${this.currentDragY}px`;
        }
      });
    }
  }

  private finishDrag() {
    cancelAnimationFrame(this.dragRaf);
    const btn = this.edgeTabRef?.nativeElement;
    if (btn) {
      btn.style.willChange = '';
      btn.style.transition = '';
    }

    this.ngZone.run(() => {
      if (this.dragMoved) {
        this.position.y = this.currentDragY;
      } else {
        this.toggleOpen();
      }
      this.cdr.markForCheck();
    });
  }

  private openedAt = 0;

  toggleOpen() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.openedAt = Date.now();
      if (!this.hasOpened) {
        this.hasOpened = true;
        if (typeof window !== 'undefined') {
          localStorage.setItem('portfolio_quest_opened', 'true');
        }
      }
    }
  }

  closeBackdrop(e?: MouseEvent | TouchEvent) {
    if (Date.now() - this.openedAt < 400) return;
    this.isOpen = false;
  }

  expand() {
    this.toggleOpen();
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
    this.isMobile = window.innerWidth < 768;
    this.position = { x: 0, y: Math.floor(window.innerHeight * 0.52) };
  }

  confirmReset() {
    if (typeof window !== 'undefined') {
      if (window.confirm('Reset all achievements and level back to Lvl 1?')) {
        this.questService.resetQuests();
      }
    }
  }
}
