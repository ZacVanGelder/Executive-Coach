"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface Props {
  wakeTime: string
  bedTime: string
  timeOptions: string[]
  onWakeChange: (t: string) => void
  onBedChange: (t: string) => void
  onNext: () => void
  onBack: () => void
}

export function TimesStep({ wakeTime, bedTime, timeOptions, onWakeChange, onBedChange, onNext, onBack }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">⏰</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Let&apos;s set up your day</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          What time do you want to wake up and go to sleep tomorrow?
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
          <div className="text-3xl mb-2">🌅</div>
          <label className="block text-xl font-bold text-gray-800 mb-1">Wake Up Time</label>
          <p className="text-gray-600 mb-4 text-sm">What time do you want to get up tomorrow?</p>
          <Select value={wakeTime} onValueChange={onWakeChange}>
            <SelectTrigger className="h-14 text-lg rounded-xl border-2 border-amber-300 focus:border-amber-500 bg-white font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {timeOptions.map(t => (
                <SelectItem key={`w-${t}`} value={t} className="text-base py-2">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-200">
          <div className="text-3xl mb-2">🌙</div>
          <label className="block text-xl font-bold text-gray-800 mb-1">Bedtime</label>
          <p className="text-gray-600 mb-4 text-sm">What time do you want to be asleep by? Be realistic — this is YOUR schedule!</p>
          <Select value={bedTime} onValueChange={onBedChange}>
            <SelectTrigger className="h-14 text-lg rounded-xl border-2 border-indigo-300 focus:border-indigo-500 bg-white font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {timeOptions.map(t => (
                <SelectItem key={`b-${t}`} value={t} className="text-base py-2">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 mb-8 border border-blue-200">
        <p className="text-sm text-blue-800 leading-relaxed">
          <span className="font-bold">💡 Coach tip: </span>
          Consistent sleep and wake times — even on weekends — make a huge difference for ADHD and autism.
          Your brain thrives on predictability. Pick realistic times you can actually stick to!
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="gap-2 rounded-xl h-12 text-base border-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-bold">
          Next: Fixed Events <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
