"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Task, FixedEvent, ScheduleBlock } from "@/types"
import { generateSchedule } from "@/lib/schedule-generator"
import { SCHEDULE_TASK_PRESETS, getTodayScheduleDayKey } from "@/lib/quest-data"
import { WelcomeScreen }  from "@/components/welcome-screen"
import { TimesStep }      from "@/components/times-step"
import { EventsStep }     from "@/components/events-step"
import { TaskStep }       from "@/components/task-step"
import { ScheduleView }   from "@/components/schedule-view"
import { QuestView }      from "@/components/quest-view"

// 30-minute increments 4 AM → 3:30 AM
const generateTimeOptions = (): string[] => {
  const opts: string[] = []
  for (let h = 4; h < 28; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h % 24
      const period  = hh >= 12 ? "PM" : "AM"
      const displayH = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
      opts.push(`${displayH}:${m.toString().padStart(2, "0")} ${period}`)
    }
  }
  return opts
}
const TIME_OPTIONS = generateTimeOptions()

const MUST_DO_EXAMPLES  = ["Apply for jobs","Update resume","LinkedIn networking","Research companies","Practice interview answers","Reply to emails"]
const WANT_TO_DO_EXAMPLES = ["Watch YouTube","Use my phone","Play video games","Watch TV / Netflix","Browse social media","Listen to podcasts"]

const DAY_LABELS: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday",
}

// Steps 1-4 shown in progress bar
const STEPS = [
  { icon: "⏰", label: "Your Day" },
  { icon: "📅", label: "Events" },
  { icon: "✅", label: "Must Do" },
  { icon: "⭐", label: "Want To Do" },
]

type Mode = "planner" | "quest"

export default function DayPlannerPage() {
  const [mode, setMode] = useState<Mode>("planner")
  // 0=welcome 1=times 2=events 3=mustdo 4=wanttodo 5=schedule
  const [step, setStep] = useState(0)
  const [wakeTime,     setWakeTime]     = useState("8:00 AM")
  const [bedTime,      setBedTime]      = useState("10:30 PM")
  const [fixedEvents,  setFixedEvents]  = useState<FixedEvent[]>([])
  const [mustDoTasks,  setMustDoTasks]  = useState<Task[]>([])
  const [wantToDoTasks,setWantToDoTasks]= useState<Task[]>([])
  const [schedule,     setSchedule]     = useState<ScheduleBlock[]>([])
  const [mustDoInput,  setMustDoInput]  = useState("")
  const [wantToDoInput,setWantToDoInput]= useState("")

  const goTo = useCallback((s: number) => {
    setStep(s)
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const addFixedEvent = useCallback((ev: Omit<FixedEvent, "id">) => {
    setFixedEvents(prev => [...prev, { id: crypto.randomUUID(), ...ev }])
  }, [])

  const removeFixedEvent = useCallback((id: string) => {
    setFixedEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  const addMustDo = useCallback(() => {
    const text = mustDoInput.trim(); if (!text) return
    setMustDoTasks(prev => [...prev, { id: crypto.randomUUID(), text }])
    setMustDoInput("")
  }, [mustDoInput])

  const addWantToDo = useCallback(() => {
    const text = wantToDoInput.trim(); if (!text) return
    setWantToDoTasks(prev => [...prev, { id: crypto.randomUUID(), text }])
    setWantToDoInput("")
  }, [wantToDoInput])

  const removeTask = useCallback((id: string, type: "must" | "want") => {
    if (type === "must") setMustDoTasks(prev => prev.filter(t => t.id !== id))
    else setWantToDoTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  // Pulls today's job-search checklist (from the Quest playbook) straight into Must-Do tasks
  const loadJobSearchPreset = useCallback(() => {
    const dayKey = getTodayScheduleDayKey()
    const presetTexts = SCHEDULE_TASK_PRESETS[dayKey]
    setMustDoTasks(prev => {
      const existingTexts = new Set(prev.map(t => t.text))
      const newOnes = presetTexts
        .filter(text => !existingTexts.has(text))
        .map(text => ({ id: crypto.randomUUID(), text }))
      return [...prev, ...newOnes]
    })
  }, [])

  const handleGenerate = useCallback(() => {
    const blocks = generateSchedule(wakeTime, bedTime, mustDoTasks, wantToDoTasks, fixedEvents)
    setSchedule(blocks)
    goTo(5)
  }, [wakeTime, bedTime, mustDoTasks, wantToDoTasks, fixedEvents, goTo])

  const handleReset = useCallback(() => {
    setStep(0); setFixedEvents([]); setMustDoTasks([]); setWantToDoTasks([])
    setSchedule([]); setMustDoInput(""); setWantToDoInput("")
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const fade = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -16 },
    transition: { duration: 0.2 },
  }

  const todayDayKey = getTodayScheduleDayKey()

  return (
    <div className="min-h-screen p-4 md:p-8 pb-16">
      <div className="max-w-2xl mx-auto">

        {/* App header */}
        <div className="text-center mb-4 print:hidden">
          <h1 className="text-2xl font-bold text-indigo-900">🧠 My Day Coach</h1>
          <p className="text-indigo-400 text-sm mt-0.5">Executive Functioning Support Tool</p>
        </div>

        {/* Mode switcher */}
        <div className="flex justify-center gap-2 mb-6 print:hidden">
          <button
            onClick={() => setMode("planner")}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2",
              mode === "planner" ? "bg-indigo-600 text-white shadow-lg scale-105" : "bg-white text-gray-500 border border-gray-200"
            )}
          >
            📅 Daily Schedule
          </button>
          <button
            onClick={() => setMode("quest")}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2",
              mode === "quest" ? "bg-indigo-600 text-white shadow-lg scale-105" : "bg-white text-gray-500 border border-gray-200"
            )}
          >
            🎮 Job Search Quest
          </button>
        </div>

        {mode === "quest" ? (
          <QuestView />
        ) : (
          <>
            {/* Progress bar — steps 1–4 */}
            {step >= 1 && step <= 4 && (
              <div className="flex justify-center gap-2 mb-6 print:hidden">
                {STEPS.map((s, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200",
                    i + 1 === step  ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : i + 1 < step  ? "bg-green-100 text-green-700"
                                    : "bg-white text-gray-400 border border-gray-200"
                  )}>
                    <span>{i + 1 < step ? "✓" : s.icon}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="welcome" {...fade}>
                  <WelcomeScreen onStart={() => goTo(1)} />
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="times" {...fade}>
                  <TimesStep
                    wakeTime={wakeTime} bedTime={bedTime} timeOptions={TIME_OPTIONS}
                    onWakeChange={setWakeTime} onBedChange={setBedTime}
                    onNext={() => goTo(2)} onBack={() => goTo(0)}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="events" {...fade}>
                  <EventsStep
                    events={fixedEvents} timeOptions={TIME_OPTIONS}
                    onAdd={addFixedEvent} onRemove={removeFixedEvent}
                    onNext={() => goTo(3)} onBack={() => goTo(1)}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="mustdo" {...fade}>
                  <TaskStep
                    title="What do you NEED to do? ✅"
                    subtitle="Add your must-do tasks for tomorrow — job applications, errands, anything you're committed to. Even one clear task gives your brain a target!"
                    placeholder="Type a task and tap Add (or press Enter)..."
                    tasks={mustDoTasks} inputValue={mustDoInput}
                    onInputChange={setMustDoInput} onAdd={addMustDo}
                    onRemove={id => removeTask(id, "must")}
                    onNext={() => goTo(4)} onBack={() => goTo(2)}
                    taskColor="blue" nextLabel="Next: Fun stuff →"
                    emptyMessage="Add at least one task! Your brain does better when it has a clear target. 🎯"
                    exampleTags={MUST_DO_EXAMPLES}
                    onLoadPreset={loadJobSearchPreset}
                    presetLabel={`✨ Load ${DAY_LABELS[todayDayKey]}'s Job Search Tasks`}
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="wanttodo" {...fade}>
                  <TaskStep
                    title="What do you WANT to do? ⭐"
                    subtitle="Add your fun activities — these become built-in rewards in your schedule. No guilt! You earn them by completing your must-do tasks."
                    placeholder="Type a fun activity and tap Add (or press Enter)..."
                    tasks={wantToDoTasks} inputValue={wantToDoInput}
                    onInputChange={setWantToDoInput} onAdd={addWantToDo}
                    onRemove={id => removeTask(id, "want")}
                    onNext={handleGenerate} onBack={() => goTo(3)}
                    taskColor="amber" nextLabel="✨ Build My Schedule!"
                    emptyMessage="Add something fun — rewards make hard work sustainable! ⭐"
                    isLastStep exampleTags={WANT_TO_DO_EXAMPLES}
                  />
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="schedule" {...fade}>
                  <ScheduleView
                    schedule={schedule} wakeTime={wakeTime} bedTime={bedTime}
                    onReset={handleReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}
