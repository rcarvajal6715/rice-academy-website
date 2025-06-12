cat > components/AppointmentPicker.jsx << 'EOF'
"use client"

import React, { useState } from "react"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { ScrollArea } from "./ui/scroll-area"
import { format } from "date-fns"

export default function AppointmentPicker() {
  const today = new Date()
  const [date, setDate] = useState(today)
  const [time, setTime] = useState(null)

  const timeSlots = [
    { time: "09:00", available: false },
    { time: "09:30", available: false },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
    { time: "12:00", available: false },
    { time: "12:30", available: true },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: false },
    { time: "15:00", available: false },
    { time: "15:30", available: true },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: true },
  ]

  return (
    <div className="rounded-lg border border-border p-4 bg-white">
      <div className="flex max-sm:flex-col gap-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) { setDate(d); setTime(null) }
          }}
          className="p-2 bg-background"
          disabled={[{ before: today }]}
        />

        <div className="relative w-full max-sm:h-48 sm:w-40">
          <ScrollArea className="h-full py-4 border-t sm:border-l border-border">
            <div className="space-y-3">
              <div className="px-5">
                <p className="text-sm font-medium">{format(date, "EEEE, d")}</p>
              </div>
              <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                {timeSlots.map(({ time: ts, available }) => (
                  <Button
                    key={ts}
                    variant={time === ts ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => setTime(ts)}
                    disabled={!available}
                  >
                    {ts}
                  </Button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground" role="region" aria-live="polite">
        Selected: {time || "none"}<br/>
        Appointment picker powered by React DayPicker.
      </p>
    </div>
  )
}
EOF