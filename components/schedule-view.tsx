"use client"

import { Button } from "@/components/ui/button"
import { Printer, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScheduleBlock, BlockCategory } from "@/types"

interface CategoryStyle { bg: string; border: string; badge: string; label: string; dot: string }

const STYLES: Record<BlockCategory, CategoryStyle> = {
  routine: { bg: 'bg-slate-50',  border: 'border-slate-200',  badge: 'bg-slate-200 text-slate-700',   label: 'Routine',      dot: 'bg-slate-400' },
  work:    { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800',     label: '🎯 Focus Work', dot: 'bg-blue-500'  },
  break:   { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-800',   label: '💚 Break',      dot: 'bg-green-500' },
  fun:     { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-800',   label: '⭐ Reward',     dot: 'bg-amber-400' },
  social:  { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', label: '💜 Social',     dot: 'bg-purple-500'},
  meal:    { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', label: '🍽️ Meal',       dot: 'bg-orange-400'},
  event:   { bg: 'bg-pink-50',   border: 'border-pink-300',   badge: 'bg-pink-100 text-pink-800',     label: '📅 Appointment',dot: 'bg-pink-500'  },
}

const LEGEND: BlockCategory[] = ['routine','work','break','fun','social','meal','event']

interface Props { schedule: ScheduleBlock[]; wakeTime: string; bedTime: string; onReset: () => void }

export function ScheduleView({ schedule, wakeTime, bedTime, onReset }: Props) {
  const workBlocks   = schedule.filter(b => b.category === 'work').length
  const rewardBlocks = schedule.filter(b => b.category === 'fun').length
  const breakBlocks  = schedule.filter(b => b.category === 'break').length
  const eventBlocks  = schedule.filter(b => b.category === 'event').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white text-center">
        <div className="text-5xl mb-3">🎯</div>
        <h2 className="text-2xl md:text-3xl font-bold mb-1">Your Schedule is Ready!</h2>
        <p className="text-lg opacity-90 font-medium">{wakeTime} → {bedTime}</p>
        <p className="opacity-80 mt-2 text-sm md:text-base leading-relaxed px-4">
          Take it one block at a time. You don&apos;t need to be perfect — just start. 💙
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-3 mt-5 flex-wrap">
          {[
            { n: workBlocks,   label: 'Focus Blocks' },
            { n: breakBlocks,  label: 'Breaks' },
            { n: rewardBlocks, label: 'Rewards' },
            ...(eventBlocks > 0 ? [{ n: eventBlocks, label: 'Appointments' }] : []),
          ].map(({ n, label }) => (
            <div key={label} className="bg-white bg-opacity-20 rounded-2xl px-4 py-2">
              <div className="text-2xl font-bold">{n}</div>
              <div className="text-xs opacity-80">{label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {LEGEND.map(cat => (
            <span key={cat} className="px-3 py-1.5 rounded-full text-xs font-bold bg-white bg-opacity-20 text-white border border-white border-opacity-30">
              {STYLES[cat].label}
            </span>
          ))}
        </div>

        <div className="flex gap-3 justify-center mt-6 print:hidden">
          <Button onClick={() => window.print()} className="bg-white text-indigo-700 hover:bg-indigo-50 gap-2 rounded-2xl font-bold shadow-md">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
          <Button onClick={onReset} variant="outline" className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 gap-2 rounded-2xl font-bold">
            <RotateCcw className="h-4 w-4" /> New Day
          </Button>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-3">
        {schedule.map(block => {
          const s = STYLES[block.category]
          return (
            <div key={block.id}
              className={cn("rounded-2xl border-2 p-5 transition-all", s.bg, s.border,
                block.category === 'event' && "ring-2 ring-pink-300 ring-offset-1")}>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={cn("w-3 h-3 rounded-full flex-shrink-0", s.dot)} />
                  <span className="text-base md:text-lg font-bold text-gray-800 font-mono">
                    {block.startTime} → {block.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400 hidden sm:inline">{block.durationMin} min</span>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold", s.badge)}>{s.label}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-4xl md:text-5xl leading-none flex-shrink-0 mt-0.5">{block.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">{block.title}</h3>
                  <p className="text-gray-700 text-base leading-relaxed">{block.description}</p>
                  {block.tip && (
                    <div className="mt-3 bg-white rounded-xl p-3 border border-gray-200">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-bold text-indigo-600">💡 Coach tip: </span>{block.tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 md:p-8 text-center text-white print:hidden">
        <p className="text-4xl mb-3">🌟</p>
        <p className="text-xl md:text-2xl font-bold mb-2">You made a plan. That&apos;s already a win!</p>
        <p className="opacity-90 leading-relaxed mb-6">
          Follow the first block, then the next. Progress — not perfection — is the goal. You&apos;ve got this! 💪
        </p>
        <Button onClick={onReset} className="bg-white text-green-700 hover:bg-green-50 font-bold px-6 py-3 text-base rounded-2xl gap-2 shadow-md">
          <RotateCcw className="h-4 w-4" /> Plan Another Day
        </Button>
      </div>
    </div>
  )
}
