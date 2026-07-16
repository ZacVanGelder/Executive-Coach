import { QUEST_DAYS, LEVELS, BADGES } from "@/lib/quest-data";
import type { DayKey } from "@/types/quest";

const STORAGE_KEY = "quest-progress-v1";

export interface QuestState {
  checks: Record<string, boolean>;        // `${dateKey}:${taskId}` -> checked
  counters: Record<string, number>;       // badgeTag -> lifetime count
  badgesEarned: string[];                 // badge ids
  streak: number;                         // consecutive days "before" fully completed
  lastBeforeCompleteDate: string | null;  // last date the "before" section was fully done
}

function emptyState(): QuestState {
  return { checks: {}, counters: {}, badgesEarned: [], streak: 0, lastBeforeCompleteDate: null };
}

export function loadState(): QuestState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveState(state: QuestState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

// ISO-ish week key: year + week number (Mon-based)
export function weekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${week}`;
}

function allTaskIds(dayKey: DayKey) {
  const day = QUEST_DAYS.find(d => d.key === dayKey);
  if (!day) return [];
  return day.sections.flatMap(s => s.tasks);
}

export function isChecked(state: QuestState, dateKey: string, taskId: string): boolean {
  return !!state.checks[`${dateKey}:${taskId}`];
}

export function toggleTask(
  state: QuestState, dateKey: string, dayKey: DayKey, taskId: string
): QuestState {
  const key = `${dateKey}:${taskId}`;
  const wasChecked = !!state.checks[key];
  const nextChecked = !wasChecked;
  const newChecks = { ...state.checks, [key]: nextChecked };

  const task = allTaskIds(dayKey).find(t => t.id === taskId);
  const newCounters = { ...state.counters };
  if (task?.badgeTag) {
    const delta = nextChecked ? 1 : -1;
    newCounters[task.badgeTag] = Math.max(0, (newCounters[task.badgeTag] ?? 0) + delta);
  }

  let newStreak = state.streak;
  let newLastBefore = state.lastBeforeCompleteDate;
  if (dayKey === "before") {
    const beforeTasks = allTaskIds("before");
    const allDone = beforeTasks.every(t => (t.id === taskId ? nextChecked : !!newChecks[`${dateKey}:${t.id}`]));
    if (allDone && newLastBefore !== dateKey) {
      const prev = newLastBefore ? new Date(newLastBefore) : null;
      const cur = new Date(dateKey);
      const isConsecutive = prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) <= 3; // allow weekends
      newStreak = isConsecutive ? newStreak + 1 : 1;
      newLastBefore = dateKey;
    } else if (!allDone && newLastBefore === dateKey) {
      newStreak = Math.max(0, newStreak - 1);
      newLastBefore = null;
    }
  }

  const newBadges = [...state.badgesEarned];
  for (const b of BADGES) {
    if (!newBadges.includes(b.id) && b.check(newCounters, newStreak)) {
      newBadges.push(b.id);
    }
  }

  const next: QuestState = {
    checks: newChecks, counters: newCounters, badgesEarned: newBadges,
    streak: newStreak, lastBeforeCompleteDate: newLastBefore,
  };
  saveState(next);
  return next;
}

export function xpForDate(state: QuestState, dateKey: string): number {
  let total = 0;
  for (const day of QUEST_DAYS) {
    for (const section of day.sections) {
      for (const task of section.tasks) {
        if (state.checks[`${dateKey}:${task.id}`]) total += task.points;
      }
    }
  }
  return total;
}

export function datesInWeek(week: string): string[] {
  const dates: string[] = [];
  const d = new Date();
  for (let i = -60; i <= 0; i++) {
    const cand = new Date(d);
    cand.setDate(cand.getDate() + i);
    if (weekKey(cand) === week) dates.push(cand.toISOString().split("T")[0]);
  }
  return dates;
}

export function xpForWeek(state: QuestState, week: string): number {
  return datesInWeek(week).reduce((sum, dk) => sum + xpForDate(state, dk), 0);
}

export function levelForXP(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.minXP) current = l;
  const idx = LEVELS.findIndex(l => l.level === current.level);
  const next = LEVELS[idx + 1] ?? null;
  return { current, next };
}
