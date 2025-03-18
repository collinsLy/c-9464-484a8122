
import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function Hero() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 30)

    const timer = setInterval(() => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })

      if (difference < 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const TimerBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="glass-effect flex flex-col items-center px-4 py-2 rounded-lg hover-lift">
      <span className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-white/70 uppercase tracking-wider">{label}</span>
    </div>
  )

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDYwIEwgNjAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yIi8+PHBhdGggZD0iTSA2MCAwIEwgNjAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4yIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-[0.15]" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            The Future of Trading
          </h1>
          
          <p className="text-xl text-white/80">
            Experience the next generation of algorithmic trading with our cutting-edge platform
          </p>

          <div className="flex justify-center gap-4">
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Minutes' },
              { value: timeLeft.seconds, label: 'Seconds' }
            ].map((item, index) => (
              <TimerBlock key={index} value={item.value} label={item.label} />
            ))}
          </div>

          <div>
            <button className="glass-effect px-8 py-4 rounded-full text-lg font-medium 
              bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 
              hover:to-blue-500/30 transition-all duration-300 hover-lift group">
              Get Started
              <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
