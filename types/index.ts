export type BlockCategory = 'routine' | 'work' | 'break' | 'fun' | 'social' | 'meal' | 'event';

export interface Task {
  id: string;
  text: string;
}

export interface FixedEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleBlock {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  category: BlockCategory;
  emoji: string;
  tip?: string;
  durationMin: number;
}
export interface ScheduleData {
  selectedDate: string;
  wakeTime: string;
  bedTime: string;
  ...
}
