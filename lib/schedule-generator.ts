import type { Task, FixedEvent, ScheduleBlock, BlockCategory } from '@/types';

const SHORT_BREAKS = [
  { title: "Hydration Break", desc: "Drink a full glass of water and take 5 slow, deep breaths. Water is literal brain fuel — dehydration tanks focus fast!", emoji: "💧" },
  { title: "Stretch Break", desc: "Stand up and stretch — reach arms overhead, roll your shoulders 5 times, touch your toes. Wake your body up!", emoji: "🤸" },
  { title: "Eye Rest Break", desc: "Look away from ALL screens and focus on something at least 20 feet away for 2 full minutes. Your eyes need this!", emoji: "👁️" },
  { title: "Movement Break", desc: "Do 10 jumping jacks, walk up and down the stairs twice, or pace around for 5 minutes. Get that blood flowing to your brain!", emoji: "🏃" },
  { title: "Breathing Break", desc: "Box breathing: IN for 4 counts, HOLD for 4, OUT for 4, HOLD for 4. Repeat 5 times. It resets your nervous system!", emoji: "🧘" },
];

const LONG_BREAKS = [
  { title: "Walk Outside", desc: "Take a 15–20 minute walk outside. No phone needed. Notice your surroundings — sky, sounds, sights around you.", emoji: "🚶" },
  { title: "Exercise Break", desc: "Get moving for 20 minutes! A workout, yoga, bike ride — whatever gets your body going. Exercise is one of the most effective ADHD strategies!", emoji: "💪" },
  { title: "Creative Time", desc: "Do something with your hands for 20 minutes — draw, doodle, play music, build something, or listen to music without multitasking.", emoji: "🎨" },
  { title: "Sunshine Break", desc: "Step outside and sit in natural light for 15–20 minutes. No phone. Just breathe, look around, let your mind wander.", emoji: "☀️" },
];

const SOCIAL_ACTIVITIES = [
  { title: "Friend Check-In", desc: "Send a quick text to a friend — 'hey, thinking of you!' or share a funny meme. Small daily connections build big friendships.", emoji: "💬" },
  { title: "LinkedIn Networking", desc: "Send ONE personalized connection request or message to someone in your field. Keep it short, genuine, and specific.", emoji: "🤝" },
  { title: "Community Explore", desc: "Browse Meetup.com, Eventbrite, or local Facebook groups for events that match your interests. Great opportunities start here!", emoji: "🌐" },
  { title: "Reconnect with a Classmate", desc: "Think of one person from college you haven't talked to recently and send a friendly message. A simple 'Hey, how's everything going?' is perfect.", emoji: "📬" },
  { title: "Family Quality Time", desc: "Spend 15 minutes talking with family — put phones away and really listen. Share one thing you worked on today.", emoji: "🏠" },
];

const WORK_TIPS = [
  "Set a 25-minute timer BEFORE you start. When it rings, stop — no matter where you are. Rest, then start another block!",
  "Before you start, write ONE specific goal: 'I will apply to [Company].' One goal only — not five!",
  "Put your phone face-down in another room. It will be there when the timer goes off — promise!",
  "Have ONLY the tabs you need open. Close everything else. Every extra tab is a potential ADHD rabbit hole!",
  "If a distracting thought pops up, write it on a sticky note and keep going. Deal with it during your break.",
  "Done is better than perfect. A submitted application beats a 'perfect' one still sitting in drafts. Send it!",
  "You don't need to feel motivated to start. Just start for 2 minutes — action creates momentum, not the other way around!",
];

const JOB_HUNT_FILLERS = [
  { title: "Skill Building", desc: "Watch a 25-minute tutorial on LinkedIn Learning, Coursera, or YouTube related to your target field. Learning is an investment in you!", emoji: "📚" },
  { title: "Company Research", desc: "Research 2–3 companies you'd love to work for. Look at their mission, culture, current openings, and recent news.", emoji: "🔍" },
  { title: "Portfolio Work", desc: "Work on a personal project or portfolio piece that demonstrates your skills. This sets you apart from other applicants!", emoji: "💼" },
  { title: "Interview Prep", desc: "Practice answering one common interview question out loud. Try: 'Tell me about yourself' or 'What's a challenge you've overcome?'", emoji: "🎤" },
];

function parseTime(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 8 * 60;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const total = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

export function generateSchedule(
  wakeTime: string,
  bedTime: string,
  mustDoTasks: Task[],
  wantToDoTasks: Task[],
  fixedEvents: FixedEvent[] = []
): ScheduleBlock[] {
  const wakeMin = parseTime(wakeTime);
  const bedMin = parseTime(bedTime);
  const adjustedBed = bedMin <= wakeMin ? bedMin + 24 * 60 : bedMin;

  const blocks: ScheduleBlock[] = [];
  let cur = wakeMin;
  let bid = 0;
  let breakIdx = 0, longBreakIdx = 0, socialIdx = 0;
  let tipIdx = 0, mustIdx = 0, wantIdx = 0, workCount = 0, fillerIdx = 0;

  // ── Normalise fixed events into the same minute-space as wakeMin ──────────
  const processedEvents = fixedEvents
    .map(ev => {
      let startMin = parseTime(ev.startTime);
      let endMin = parseTime(ev.endTime);
      if (startMin < wakeMin) startMin += 24 * 60;
      if (endMin <= startMin) endMin += 24 * 60;
      return { ...ev, startMin, endMin };
    })
    .filter(ev => ev.startMin >= wakeMin && ev.startMin < adjustedBed)
    .sort((a, b) => a.startMin - b.startMin);

  let eventIdx = 0;

  const nextEventAt = () =>
    eventIdx < processedEvents.length ? processedEvents[eventIdx].startMin : adjustedBed;

  // Insert events whose start time has arrived
  const flushEvents = () => {
    while (eventIdx < processedEvents.length && processedEvents[eventIdx].startMin <= cur) {
      const ev = processedEvents[eventIdx];
      const evEnd = Math.min(ev.endMin, adjustedBed);
      if (evEnd > cur) {
        blocks.push({
          id: `fixed-${bid++}`,
          startTime: formatTime(cur),
          endTime: formatTime(evEnd),
          title: `📅 ${ev.title}`,
          description: `Scheduled appointment: "${ev.title}." This time is fully blocked — no other tasks during this slot.`,
          category: 'event',
          emoji: '📅',
          tip: 'Before: make sure you have everything you need ready (keys, wallet, anything appointment-specific). After: give yourself 5–10 minutes to settle back in before jumping into the next task.',
          durationMin: evEnd - cur,
        });
        cur = evEnd;
      }
      eventIdx++;
    }
  };

  // Core add — caps duration at the next event start so nothing overlaps
  const add = (
    dur: number,
    title: string,
    desc: string,
    cat: BlockCategory,
    emoji: string,
    tip?: string
  ): boolean => {
    flushEvents();
    if (cur >= adjustedBed - 5) return false;
    const ceiling = Math.min(nextEventAt(), adjustedBed);
    const actual = Math.min(dur, ceiling - cur);
    if (actual < 5) { flushEvents(); return false; }
    blocks.push({
      id: `b${bid++}`,
      startTime: formatTime(cur),
      endTime: formatTime(cur + actual),
      title, description: desc, category: cat, emoji, tip,
      durationMin: actual,
    });
    cur += actual;
    return true;
  };

  // Resolve an anchor time — push it past any event that covers it
  const resolveAnchor = (ideal: number): number => {
    let t = ideal;
    for (const ev of processedEvents) {
      if (ev.startMin <= t && t < ev.endMin) t = ev.endMin;
    }
    return t;
  };

  // ── Anchor times ──────────────────────────────────────────────────────────
  const lunchMin = resolveAnchor(Math.max(11.5 * 60, Math.min(13.5 * 60, wakeMin + 4 * 60)));
  const dinnerMin = resolveAnchor(Math.max(17.5 * 60, Math.min(19.5 * 60, adjustedBed - 3 * 60)));
  const windDownMin = adjustedBed - 60;

  // ── Morning Routine ───────────────────────────────────────────────────────
  add(30, "Morning Routine",
    "Wake up, brush teeth, wash face, and get dressed. Try to do your routine in the SAME order every single day — consistency is a superpower for ADHD brains!",
    'routine', '🌅',
    "A predictable morning routine means zero decisions needed. Your brain just follows the script. Same order, every day — this builds momentum automatically!");

  add(30, "Breakfast Time",
    "Eat a proper breakfast before any work! Eggs with toast, oatmeal with fruit, yogurt and granola, or a smoothie all work great. Drink a full glass of water too!",
    'meal', '🍳',
    "Skipping breakfast seriously tanks focus and mood. ADHD brains run on glucose — fuel up before you try to use your brain. Don't skip this!");

  // ── Morning work session ──────────────────────────────────────────────────
  let morningWorkDone = false;
  while (cur < lunchMin - 20 && !morningWorkDone) {
    flushEvents();
    if (cur >= lunchMin - 20) break;
    const hasTask = mustIdx < mustDoTasks.length;
    if (hasTask) {
      const task = mustDoTasks[mustIdx];
      add(25, `🎯 Focus: ${task.text}`,
        `Set your 25-minute timer NOW, then work ONLY on: "${task.text}." One task, full focus — no multitasking!`,
        'work', '🎯', WORK_TIPS[tipIdx++ % WORK_TIPS.length]);
      workCount++;
      if (workCount % 2 === 0) mustIdx++;
    } else {
      const filler = JOB_HUNT_FILLERS[fillerIdx++ % JOB_HUNT_FILLERS.length];
      add(25, `${filler.emoji} ${filler.title}`, filler.desc, 'work', filler.emoji,
        WORK_TIPS[tipIdx++ % WORK_TIPS.length]);
      workCount++;
      if (workCount >= 6) { morningWorkDone = true; break; }
    }
    if (cur < lunchMin - 20) {
      const b = SHORT_BREAKS[breakIdx++ % SHORT_BREAKS.length];
      add(10, b.title, b.desc, 'break', b.emoji);
    }
    if (workCount >= 6) { morningWorkDone = true; break; }
  }

  flushEvents();
  if (cur < lunchMin - 25) {
    const lb = LONG_BREAKS[longBreakIdx++ % LONG_BREAKS.length];
    const gap = Math.min(lunchMin - cur - 5, nextEventAt() - cur);
    if (gap >= 20) add(gap, lb.title, lb.desc, 'break', lb.emoji,
      "Physical activity between work sessions dramatically improves ADHD focus. Strategic rest — not wasted time!");
  }

  // ── Lunch ────────────────────────────────────────────────────────────────
  flushEvents();
  if (cur < adjustedBed - 2.5 * 60 && cur < dinnerMin - 60) {
    const social = SOCIAL_ACTIVITIES[socialIdx % SOCIAL_ACTIVITIES.length];
    add(45, "Lunch Break 🍽️",
      `Step away from your desk and eat a real meal! Social idea for lunch: ${social.desc}`,
      'meal', '🍽️',
      "Eating lunch at your desk doesn't count as rest. A real break — away from screens — resets your brain for the afternoon. You deserve the full 45 minutes!");
  }

  flushEvents();
  if (cur < adjustedBed - 2 * 60 && cur < dinnerMin - 45) {
    add(15, "Rest & Reset",
      "Take a short rest — lie down, close your eyes, or sit quietly without a screen. PLANNED recovery, not laziness. Your brain needs this!",
      'break', '😌',
      "Many neurodivergent people experience a strong post-lunch energy dip. A 15-minute planned rest is FAR better than 2 hours of foggy struggling. Science backs this up!");
  }

  // ── Afternoon reward ──────────────────────────────────────────────────────
  flushEvents();
  if (wantToDoTasks.length > 0 && cur < dinnerMin - 2 * 60) {
    const want = wantToDoTasks[wantIdx % wantToDoTasks.length];
    wantIdx++;
    add(45, `⭐ Reward Time: ${want.text}`,
      `You earned this! Enjoy "${want.text}" for 45 minutes. Set a timer BEFORE you start so you can fully relax without anxiety about time passing.`,
      'fun', '⭐',
      "Using want-to-do activities as planned rewards is a proven ADHD strategy. Your brain gets the dopamine boost AND you've genuinely earned it. No guilt — this is part of the plan!");
  }

  // ── Afternoon work session ────────────────────────────────────────────────
  let afCount = 0;
  while (cur < dinnerMin - 50 && mustIdx < mustDoTasks.length && afCount < 4) {
    flushEvents();
    if (cur >= dinnerMin - 50) break;
    const task = mustDoTasks[mustIdx];
    add(25, `🎯 Focus: ${task.text}`,
      `Back at it! Timer for 25 minutes: "${task.text}." You're in the home stretch — every block gets you closer to done!`,
      'work', '🎯', WORK_TIPS[tipIdx++ % WORK_TIPS.length]);
    workCount++; afCount++;
    if (workCount % 2 === 0) mustIdx++;
    if (mustIdx >= mustDoTasks.length) break;
    if (cur < dinnerMin - 50 && afCount < 4) {
      const b = SHORT_BREAKS[breakIdx++ % SHORT_BREAKS.length];
      add(10, b.title, b.desc, 'break', b.emoji);
    }
  }

  flushEvents();
  if (cur < dinnerMin - 60 && mustDoTasks.length > 0 && mustIdx >= mustDoTasks.length) {
    const filler = JOB_HUNT_FILLERS[fillerIdx++ % JOB_HUNT_FILLERS.length];
    add(25, `✨ Bonus: ${filler.title}`, filler.desc, 'work', filler.emoji,
      "You finished all your planned tasks — amazing! This block is optional. Use it for self-care or extra social connection too.");
  }

  // ── Afternoon social ──────────────────────────────────────────────────────
  flushEvents();
  if (cur < dinnerMin - 30) {
    const s = SOCIAL_ACTIVITIES[socialIdx++ % SOCIAL_ACTIVITIES.length];
    const dur = Math.min(30, Math.min(dinnerMin, nextEventAt()) - cur - 15);
    if (dur >= 15) add(dur, `${s.emoji} Social Time: ${s.title}`, s.desc, 'social', s.emoji,
      "Social skills strengthen with daily practice. A short daily effort — even texting — reduces isolation and grows your network!");
  }

  // Fill gap to dinner
  flushEvents();
  if (cur < dinnerMin - 20) {
    const lb = LONG_BREAKS[longBreakIdx++ % LONG_BREAKS.length];
    const gap = Math.min(dinnerMin - cur, nextEventAt() - cur);
    if (gap >= 15) add(gap, lb.title, lb.desc, 'break', lb.emoji,
      "Regular exercise is one of the most effective ways to manage ADHD. Make movement a daily non-negotiable!");
  }

  // ── Dinner ────────────────────────────────────────────────────────────────
  flushEvents();
  if (cur < adjustedBed - 1.5 * 60 && cur < windDownMin - 60) {
    add(60, "Dinner Time",
      "Enjoy a relaxed dinner — ideally with family. No phones at the table if possible. Let this be your real transition from 'work day' to 'evening.'",
      'meal', '🍽️',
      "Dinner marks the natural end of your work day. Let yourself mentally clock out — you've done your work. Now enjoy the evening!");
  }

  // ── Evening free time ─────────────────────────────────────────────────────
  flushEvents();
  if (cur < windDownMin - 20) {
    if (wantToDoTasks.length > 0) {
      const want = wantToDoTasks[wantIdx % wantToDoTasks.length];
      const dur = Math.min(windDownMin - cur - 20, 90, nextEventAt() - cur);
      if (dur >= 20) {
        add(dur, `🎉 Evening Free Time: ${want.text}`,
          `Enjoy your evening! "${want.text}" — you worked hard today and this time is completely, guilt-freely yours.`,
          'fun', '🎉',
          "Evening free time is part of a healthy routine — not something you have to 'earn.' Rest and enjoyment are necessary, not optional!");
        wantIdx++;
      }
    } else {
      const s = SOCIAL_ACTIVITIES[socialIdx % SOCIAL_ACTIVITIES.length];
      const dur = Math.min(windDownMin - cur - 20, 60, nextEventAt() - cur);
      if (dur >= 15) add(dur, `${s.emoji} Evening: ${s.title}`, s.desc, 'social', s.emoji);
    }
  }

  flushEvents();
  if (cur < windDownMin - 10) {
    const gap = Math.min(windDownMin - cur, nextEventAt() - cur);
    if (gap >= 10) add(gap, "Relax & Decompress",
      "Free time! Watch something, listen to music, play a casual game, or just rest. Do whatever helps YOU recharge best.", 'break', '🛋️');
  }

  // ── Wind-down ─────────────────────────────────────────────────────────────
  flushEvents();
  if (cur < adjustedBed - 25) {
    const d = Math.min(30, adjustedBed - cur - 20, nextEventAt() - cur);
    if (d >= 10) add(d, "Wind-Down Time 🌙",
      "No screens! Read a book, do light stretching, journal what went well today, or listen to calm music. Let your brain start powering down.",
      'routine', '🌙',
      "Screens emit blue light that blocks melatonin — the sleep hormone. Even 20–30 screen-free minutes before bed dramatically improves sleep quality AND next-day focus!");
  }

  flushEvents();
  if (cur < adjustedBed - 10) {
    const d = Math.min(15, adjustedBed - cur - 5, nextEventAt() - cur);
    if (d >= 5) add(d, "📋 Plan Tomorrow (3 Things!)",
      "Write down just THREE things you want to accomplish tomorrow. Put them somewhere visible. Then plug in your phone — ideally in another room!",
      'routine', '📋',
      "Writing tomorrow's tasks before bed means your brain can fully let go tonight. You've already done the thinking — now just sleep. Game-changer habit!");
  }

  flushEvents();
  if (cur < adjustedBed) {
    add(adjustedBed - cur, "Bedtime Routine",
      "Brush teeth, wash face, change into comfortable clothes. Same order every night — this is your brain's signal that sleep is coming.",
      'routine', '💤',
      "Consistent sleep AND wake times (even on weekends!) are one of the most powerful ADHD tools. Your brain thrives on predictability. Sweet dreams! 💙");
  }

  flushEvents();
  return blocks;
}
