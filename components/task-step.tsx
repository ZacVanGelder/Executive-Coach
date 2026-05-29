"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, ArrowRight, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Task } from "@/types"

interface Props {
  title: string
  subtitle: string
  placeholder: string
  tasks: Task[]
  inputValue: string
  onInputChange: (v: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onNext: () => void
  onBack: () => void
  taskColor: 'blue' | 'amber'
  nextLabel?: string
  emptyMessage?: string
  isLastStep?: boolean
  exampleTags?: string[]
}

export function TaskStep({
  title, subtitle, placeholder, tasks, inputValue, onInputChange, onAdd, onRemove,
  onNext, onBack, taskColor, nextLabel = "Next", emptyMessage, isLastStep, exampleTags
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); onAdd() }
  }

  const c = {
    blue: {
      taskBg: "bg-blue-50", taskBorder: "border-blue-200", taskText: "text-blue-800",
      numBg: "bg-blue-200 text-blue-700", remove: "hover:bg-blue-200 text-blue-400 hover:text-blue-700",
      tag: "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200",
      input: "border-blue-200 focus:border-blue-500", add: "bg-blue-600 hover:bg-blue-700",
    },
    amber: {
      taskBg: "bg-amber-50", taskBorder: "border-amber-200", taskText: "text-amber-800",
      numBg: "bg-amber-200 text-amber-700", remove: "hover:bg-amber-200 text-amber-400 hover:text-amber-700",
      tag: "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200",
      input: "border-amber-200 focus:border-amber-500", add: "bg-amber-500 hover:bg-amber-600",
    },
  }[taskColor]

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 text-base leading-relaxed mb-5">{subtitle}</p>

      {exampleTags && exampleTags.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2 font-bold">EXAMPLES (tap to fill):</p>
          <div className="flex flex-wrap gap-2">
            {exampleTags.map(tag => (
              <button key={tag} onClick={() => onInputChange(tag)}
                className={cn("px-3 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer", c.tag)}>
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <Input
          autoFocus value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("text-base h-14 rounded-xl border-2 font-medium", c.input)}
        />
        <Button onClick={onAdd} disabled={!inputValue.trim()}
          className={cn("h-14 px-5 rounded-xl text-white gap-1 flex-shrink-0 font-bold", c.add)}>
          <Plus className="h-5 w-5" /> Add
        </Button>
      </div>

      <div className="min-h-[130px] mb-6">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center h-[130px] border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400 text-center px-6 text-base leading-relaxed">{emptyMessage || "Add a task above ↑"}</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task, i) => (
                <motion.div key={task.id}
                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border-2", c.taskBg, c.taskBorder)}>
                  <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", c.numBg)}>
                    {i + 1}
                  </span>
                  <span className={cn("flex-1 font-medium text-base", c.taskText)}>{task.text}</span>
                  <button onClick={() => onRemove(task.id)}
                    className={cn("p-1.5 rounded-lg transition-all flex-shrink-0", c.remove)}>
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {isLastStep && tasks.length === 0 && (
        <p className="text-center text-sm text-gray-400 mb-4">
          No fun activities? That&apos;s okay — but adding even one makes the day more motivating! 😊
        </p>
      )}

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="gap-2 rounded-xl h-12 text-base border-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext}
          className={cn("flex-1 gap-2 rounded-xl text-white h-12 text-base font-bold shadow-md",
            isLastStep ? "bg-green-600 hover:bg-green-700 text-lg" : "bg-indigo-600 hover:bg-indigo-700")}>
          {nextLabel}
          {!isLastStep && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
