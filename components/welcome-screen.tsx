"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface Props { onStart: () => void }

export function WelcomeScreen({ onStart }: Props) {
  const features = [
    { icon: "⏰", text: "Full schedule from wake-up to lights out" },
    { icon: "📅", text: "Block out appointments & fixed events" },
    { icon: "🎯", text: "25-minute focus blocks (ADHD-optimized)" },
    { icon: "⭐", text: "Fun rewards built right into your day" },
    { icon: "💚", text: "Healthy breaks & movement reminders" },
    { icon: "🤝", text: "Daily social connection suggestions" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl shadow-xl border border-indigo-100 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-center text-white">
        <div className="text-6xl mb-3">🧠</div>
        <h1 className="text-3xl font-bold mb-1">My Day Coach</h1>
        <p className="text-lg opacity-90">Your executive functioning partner</p>
      </div>

      <div className="p-8">
        <p className="text-xl text-gray-700 leading-relaxed mb-6 text-center">
          Every great day starts with a great plan. I&apos;ll help you build a schedule that
          actually works for{" "}
          <span className="font-bold text-indigo-700">how your brain works.</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <span className="text-2xl flex-shrink-0">{f.icon}</span>
              <span className="text-gray-700 font-medium text-sm">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 mb-8 border border-amber-200">
          <p className="text-sm font-bold text-amber-800 mb-3">⚡ How it works (about 2 minutes)</p>
          {[
            "Set your wake & bed times",
            "Add any appointments with set times (haircut, doctor, etc.)",
            "Add what you NEED to do",
            "Add what you WANT to do (your rewards!)",
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-amber-700 mt-2">
              <span className="bg-amber-200 text-amber-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span>{s}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-amber-700 mt-2">
            <span className="bg-green-200 text-green-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">✓</span>
            <span>Get your full personalized schedule!</span>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mb-6">
          No account needed. No sign-up. Completely free. 💙
        </p>

        <Button
          onClick={onStart}
          size="lg"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-7 rounded-2xl gap-3 shadow-lg"
        >
          Let&apos;s Plan My Day! <ArrowRight className="h-6 w-6" />
        </Button>
      </div>
    </motion.div>
  )
}
