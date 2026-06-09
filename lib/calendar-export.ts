import { ScheduleBlock } from '@/types';

function toICSDate(dateStr: string, timeStr: string): string {
  // dateStr: "2024-01-15", timeStr: "9:00 AM"
  const [year, month, day] = dateStr.split('-').map(Number);
  const [time, meridiem] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return `${String(year)}${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}T${String(hours).padStart(2,'0')}${String(minutes).padStart(2,'0')}00`;
}

function escapeICS(str: string): string {
  return str.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
}

export function generateICS(blocks: ScheduleBlock[], scheduleDate: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Executive Coach//Zac Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:My Day Schedule',
    'X-WR-TIMEZONE:America/New_York',
  ];

  blocks.forEach((block, i) => {
    const dtStart = toICSDate(scheduleDate, block.startTime);
    const dtEnd   = toICSDate(scheduleDate, block.endTime);
    const uid     = `coach-block-${i}-${scheduleDate}@executive-coach`;
    const desc    = block.description + (block.tip ? `\\n\\n💡 Coach Tip: ${block.tip}` : '');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(block.emoji + ' ' + block.title)}`,
      `DESCRIPTION:${escapeICS(desc)}`,
      `CATEGORIES:${block.category.toUpperCase()}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(blocks: ScheduleBlock[], scheduleDate: string): void {
  const icsContent = generateICS(blocks, scheduleDate);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `my-schedule-${scheduleDate}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Returns tomorrow's date as YYYY-MM-DD (the schedule is always for tomorrow) */
export function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}
