import { Injectable, signal, computed } from '@angular/core';

export type AchievementKey =
  | 'LAND_ON_PORTFOLIO'
  | 'VIEW_RESUME'
  | 'FULLSCREEN_PDF'
  | 'TRIGGER_CHAOS'
  | 'CHAT_QUERY'
  | 'EXPAND_PROMOTION';

export type Achievement = {
  key: AchievementKey;
  title: string;
  description: string;
  xp: number;
};

export const ACHIEVEMENTS: Record<AchievementKey, Omit<Achievement, 'key'>> = {
  LAND_ON_PORTFOLIO: {
    title: 'Hello World!',
    description: "Land on Parth's portfolio website.",
    xp: 100,
  },
  VIEW_RESUME: {
    title: 'Resume Scout',
    description: 'Access the Interactive Resume page.',
    xp: 150,
  },
  FULLSCREEN_PDF: {
    title: 'Deep Focus',
    description: 'Inspect the resume PDF in fullscreen mode.',
    xp: 150,
  },
  TRIGGER_CHAOS: {
    title: 'Chaos Engineer',
    description: 'Trigger a simulation event in the system architecture dashboard.',
    xp: 250,
  },
  CHAT_QUERY: {
    title: 'Interrogator',
    description: 'Ask the AI chatbot assistant a question.',
    xp: 200,
  },
  EXPAND_PROMOTION: {
    title: 'SDE Promotion Track',
    description: 'Inspect SDE II promotion details in the timeline.',
    xp: 150,
  },
};

export type QuestToast = {
  id: string;
  title: string;
  description: string;
  xp?: number;
  type: 'achievement' | 'levelup';
};

export const XP_PER_LEVEL = 500;
export const MAX_LEVEL = 5;

export const LEVEL_CLASS_NAMES = [
  'Novice Reviewer',
  'Observer',
  'Reliability Inspector',
  'Systems Analyst',
  'Lead System Evaluator',
];

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private levelSignal = signal<number>(1);
  private xpSignal = signal<number>(0);
  private unlockedSignal = signal<Record<AchievementKey, boolean>>({
    LAND_ON_PORTFOLIO: false,
    VIEW_RESUME: false,
    FULLSCREEN_PDF: false,
    TRIGGER_CHAOS: false,
    CHAT_QUERY: false,
    EXPAND_PROMOTION: false,
  });
  private toastsSignal = signal<QuestToast[]>([]);

  level = computed(() => this.levelSignal());
  xp = computed(() => this.xpSignal());
  unlockedAchievements = computed(() => this.unlockedSignal());
  toasts = computed(() => this.toastsSignal());

  constructor() {
    this.loadState();
    this.loadConfettiScript();
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const savedLevel = localStorage.getItem('quest_level');
      if (savedLevel) this.levelSignal.set(parseInt(savedLevel, 10));

      const savedXp = localStorage.getItem('quest_xp');
      if (savedXp) this.xpSignal.set(parseInt(savedXp, 10));

      const savedUnlocked = localStorage.getItem('quest_unlocked');
      if (savedUnlocked) {
        this.unlockedSignal.set(JSON.parse(savedUnlocked));
      }
    } catch (e) {
      console.warn('Failed to load quest state from localStorage', e);
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('quest_level', this.levelSignal().toString());
      localStorage.setItem('quest_xp', this.xpSignal().toString());
      localStorage.setItem('quest_unlocked', JSON.stringify(this.unlockedSignal()));
    } catch (e) {
      console.warn('Failed to save quest state to localStorage', e);
    }
  }

  private loadConfettiScript() {
    if (typeof window === 'undefined') return;
    if ((window as any).confetti) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
    script.async = true;
    document.head.appendChild(script);
  }

  unlockAchievement(key: AchievementKey) {
    if (this.unlockedSignal()[key]) return;

    // Mark as unlocked
    this.unlockedSignal.update(prev => ({ ...prev, [key]: true }));

    const details = ACHIEVEMENTS[key];
    const rewardXp = details.xp;

    let currentXp = this.xpSignal() + rewardXp;
    let currentLevel = this.levelSignal();
    let leveledUp = false;

    if (currentXp >= XP_PER_LEVEL && currentLevel < MAX_LEVEL) {
      currentXp -= XP_PER_LEVEL;
      currentLevel += 1;
      leveledUp = true;
    }

    this.xpSignal.set(currentXp);
    this.levelSignal.set(currentLevel);

    // Save state
    this.saveState();

    // Trigger confetti
    this.triggerConfetti();

    // Add toast
    const toastId = Math.random().toString(36).substring(2, 9);
    const newToast: QuestToast = {
      id: toastId,
      title: details.title,
      description: details.description,
      xp: rewardXp,
      type: 'achievement'
    };

    this.toastsSignal.update(prev => [...prev, newToast]);

    if (leveledUp) {
      const levelToastId = Math.random().toString(36).substring(2, 9);
      const levelToast: QuestToast = {
        id: levelToastId,
        title: `Leveled Up to Lvl ${currentLevel}!`,
        description: `You are now a ${LEVEL_CLASS_NAMES[currentLevel - 1]}.`,
        type: 'levelup'
      };
      // Short delay for double toasts spacing
      setTimeout(() => {
        this.toastsSignal.update(prev => [...prev, levelToast]);
      }, 100);
    }

    // Fade-out 400ms before removal
    setTimeout(() => this.fadeToast(toastId), 4100);
    setTimeout(() => this.removeToast(toastId), 4500);
  }

  private fadingToasts = new Set<string>();
  isFading(id: string): boolean { return this.fadingToasts.has(id); }

  fadeToast(id: string) {
    this.fadingToasts.add(id);
  }

  removeToast(id: string) {
    this.fadingToasts.delete(id);
    this.toastsSignal.update(prev => prev.filter(t => t.id !== id));
  }

  resetQuests() {
    this.levelSignal.set(1);
    this.xpSignal.set(0);
    this.unlockedSignal.set({
      LAND_ON_PORTFOLIO: false,
      VIEW_RESUME: false,
      FULLSCREEN_PDF: false,
      TRIGGER_CHAOS: false,
      CHAT_QUERY: false,
      EXPAND_PROMOTION: false,
    });
    this.toastsSignal.set([]);
    this.saveState();
  }

  private triggerConfetti() {
    if (typeof window === 'undefined') return;
    const confetti = (window as any).confetti;
    if (typeof confetti === 'function') {
      try {
        const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'];
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 1 }, colors });
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 1 }, colors });
      } catch (e) {
        // ignore
      }
    }
  }

  getLevelClassName(): string {
    return LEVEL_CLASS_NAMES[this.levelSignal() - 1] || 'Observer';
  }
}
