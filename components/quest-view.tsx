"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { QUEST_DAYS, LEVELS, BADGES } from "@/lib/quest-data"
import {
  loadState, toggleTask, isChecked, todayKey, weekKey,
  xpForDate, xpForWeek, levelForXP, type QuestState,
} from "@/lib/quest-engine"
import type { DayKey } from "@/types/quest"

const DAY_ORDER: DayKey[] = ["before", "monday", "tuesday", "wednesday", "thursday", "friday"]

export function QuestView() {
  const [state, setState] = useState<QuestState | null>(null)
  const [activeDay, setActiveDay] = useState<DayKey>("before")
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null)
  const dateKey = useMemo(() => todayKey(), [])
  const wKey = useMemo(() => weekKey(), [])

  useEffect(() => { setState(loadState()) }, [])

  if (!state) {
    return <div className="text-center py-20 text-indigo-400">Loading your quest log...</div>
  }

  const handleToggle = (taskId: string) => {
    const prevBadges = state.badgesEarned;
    const next = toggleTask(state, dateKey, activeDay, taskId)
    setState(next)
    const newlyEarned = next.badgesEarned.find(b => !prevBadges.includes(b))
    if (newlyEarned) {
      const badge = BADGES.find(b => b.id === newlyEarned)
      if (badge) {
        setJustUnlocked(`${badge.emoji} ${badge.name}`)
        setTimeout(() => setJustUnlocked(null), 3500)
      }
    }
  }

  const day = QUEST_DAYS.find(d => d.key === activeDay)!
  const todayXP = xpForDate(state, dateKey)
  const weekXP = xpForWeek(state, wKey)
  const { current, next } = levelForXP(weekXP)
  const progressToNext = next ? Math.min(100, Math.round(((weekXP - current.minXP) / (next.minXP - current.minXP)) * 100)) : 100

  const totalTasksToday = day.sections.reduce((sum, s) => sum + s.tasks.length, 0)
  const doneTasksToday = day.sections.reduce(
    (sum, s) => sum + s.tasks.filter(t => isChecked(state, dateKey, t.id)).length, 0
  )

  return (
    <div className="space-y-4">
      {/* Badge unlock toast */}
      <AnimatePresence>
        {justUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl"
          >
            🎉 Badge Unlocked: {justUnlocked}
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP / Level header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70">This Week</p>
            <p className="text-2xl font-bold">{current.emoji} {current.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide opacity-70">Weekly XP</p>
            <p className="text-3xl font-bold">{weekXP}</p>
          </div>
        </div>
        {next && (
          <>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-amber-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-xs mt-1.5 opacity-80">{next.minXP - weekXP} XP to {next.emoji} {next.name}</p>
          </>
        )}
        <div className="flex gap-4 mt-4 text-sm">
          <div className="bg-white/15 rounded-xl px-3 py-1.5">🔥 {state.streak}-day streak</div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5">✅ {todayXP} XP today</div>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAY_ORDER.map(k => {
          const d = QUEST_DAYS.find(qd => qd.key === k)!
          return (
            <button
              key={k}
              onClick={() => setActiveDay(k)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-bold transition-all flex items-center gap-1.5",
                activeDay === k ? "bg-indigo-600 text-white shadow-md scale-105" : "bg-white text-gray-500 border border-gray-200"
              )}
            >
              <span>{d.emoji}</span> {d.label}
            </button>
          )
        })}
      </div>

      {/* Active day card */}
      <div className="bg-white rounded-3xl border-2 border-indigo-100 p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h2 className="text-xl font-bold text-gray-900">{day.emoji} {day.label}</h2>
          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
            {doneTasksToday}/{totalTasksToday} done
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">{day.goal}</p>

        <div className="space-y-5">
          {day.sections.map(section => (
            <div key={section.id}>
              <h3 className="text-sm font-bold text-indigo-700 mb-2">{section.title}</h3>
              <div className="space-y-1.5">
                {section.tasks.map(task => {
                  const checked = isChecked(state, dateKey, task.id)
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleToggle(task.id)}
                      className={cn(
                        "w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl border-2 transition-all",
                        checked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100 hover:border-indigo-200"
                      )}
                    >
                      <span className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all",
                        checked ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-transparent"
                      )}>
                        {checked ? "✓" : ""}
                      </span>
                      <span className={cn("flex-1 text-sm", checked ? "text-gray-400 line-through" : "text-gray-800")}>
                        {task.text}
                      </span>
                      <span className="flex-shrink-0 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        +{task.points}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge case */}
      <div className="bg-white rounded-3xl border-2 border-amber-100 p-5 md:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🎖️ Badge Case</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {BADGES.map(b => {
            const earned = state.badgesEarned.includes(b.id)
            return (
              <div key={b.id} className={cn(
                "flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all",
                earned ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-100 opacity-50"
              )}>
                <span className="text-3xl mb-1">{earned ? b.emoji : "🔒"}</span>
                <span className="text-xs font-bold text-gray-700 leading-tight">{b.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Level chart */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-5 md:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">🏆 Level Chart</h2>
        <div className="space-y-1.5">
          {LEVELS.map(l => (
            <div key={l.level} className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl text-sm",
              l.level === current.level ? "bg-indigo-50 border-2 border-indigo-300 font-bold" : "bg-gray-50"
            )}>
              <span>{l.emoji} {l.name}</span>
              <span className="text-gray-500">{l.minXP}+ XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
