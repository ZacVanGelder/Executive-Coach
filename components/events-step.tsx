"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, ArrowRight, ArrowLeft, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { FixedEvent } from "@/types"

interface Props {
  events: FixedEvent[];
  timeOptions: string[];
  onAdd: (event: Omit<FixedEvent, 'id'>) => void;
  onRemove: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const EVENT_EXAMPLES = [
  "Haircut", "Doctor visit", "Dentist", "Lunch with friend",
  "Therapy session", "Job interview", "Gym class", "Family dinner",
];

export function EventsStep({ events, timeOptions, onAdd, onRemove, onNext, onBack }: Props) {
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("10:00 AM")
  const [endTime, setEndTime] = useState("11:00 AM")
  const [error, setError] = useState("")

  const handleAdd = () => {
    if (!title.trim()) {
      setError("Please enter an event name.")
      return
    }
    setError("")
    onAdd({ title: title.trim(), startTime, endTime })
    setTitle("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd()
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Any fixed events tomorrow?
        </h2>
        <p className="text-gray-600 leading-relaxed text-base">
          Got a haircut at 10 AM? A doctor&apos;s appointment? A lunch plan? Add it here and
          your schedule will automatically block out that time.
        </p>
      </div>

      {/* Example tags */}
      <div className="mb-5">
        <p className="text-xs font-bold text-gray-400 mb-2">EXAMPLES (tap to fill):</p>
        <div className="flex flex-wrap gap-2">
          {EVENT_EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setTitle(ex)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all"
            >
              + {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Input card */}
      <div className="bg-indigo-50 rounded-2xl p-5 border-2 border-indigo-200 mb-6">
        {/* Event name */}
        <label className="block text-sm font-bold text-gray-700 mb-1">Event name</label>
        <Input
          autoFocus
          value={title}
          onChange={e => { setTitle(e.target.value); setError("") }}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Haircut, Doctor visit, Lunch with friend..."
          className={cn(
            "h-12 text-base rounded-xl border-2 bg-white mb-4",
            error ? "border-red-400" : "border-indigo-200 focus:border-indigo-500"
          )}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Times */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              🕐 Start time
            </label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger className="h-11 text-base rounded-xl border-2 border-indigo-200 bg-white font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {timeOptions.map(t => (
                  <SelectItem key={`es-${t}`} value={t} className="text-sm py-2">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              🕑 End time
            </label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger className="h-11 text-base rounded-xl border-2 border-indigo-200 bg-white font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {timeOptions.map(t => (
                  <SelectItem key={`ee-${t}`} value={t} className="text-sm py-2">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleAdd}
          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Event to Schedule
        </Button>
      </div>

      {/* Events list */}
      <div className="min-h-[80px] mb-6">
        <AnimatePresence>
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-[80px] border-2 border-dashed border-gray-200 rounded-2xl"
            >
              <p className="text-gray-400 text-center text-sm px-4">
                No fixed events added — your schedule is wide open! ✨
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {events.map(ev => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3 px-4 py-3 bg-indigo-50 rounded-2xl border-2 border-indigo-200"
                >
                  <Calendar className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-indigo-900 truncate">{ev.title}</p>
                    <p className="text-sm text-indigo-600 font-medium">
                      {ev.startTime} → {ev.endTime}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(ev.id)}
                    className="p-1.5 rounded-lg text-indigo-400 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0"
                    aria-label="Remove event"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Coach tip */}
      <div className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-200">
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-bold">💡 Coach tip: </span>
          Your schedule will automatically work around these events — including a reminder
          to prepare before each one and decompress after. No need to worry about the timing!
        </p>
      </div>

      {/* Nav */}
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="gap-2 rounded-xl h-12 border-2 text-base">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-12 font-bold text-base"
        >
          Next: Must-Do Tasks
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
