export type DayKey = "before" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

export type BadgeTag =
  | "application" | "connection" | "walkin" | "certification"
  | "interview" | "volunteer" | "thankyou";

export interface QuestTask {
  id: string;
  text: string;
  points: number;
  badgeTag?: BadgeTag;
}

export interface QuestSection {
  id: string;
  title: string;
  tasks: QuestTask[];
}

export interface QuestDay {
  key: DayKey;
  label: string;
  emoji: string;
  goal: string;
  sections: QuestSection[];
}

export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
  check: (counters: Record<string, number>, streak: number) => boolean;
}

export interface LevelDef {
  level: number;
  emoji: string;
  name: string;
  minXP: number;
}
