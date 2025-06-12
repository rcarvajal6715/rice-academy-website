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
    <div className="rounded-lg border border-gray-200 p-4 bg-white">
      <div className="flex flex-col sm:flex-row gap-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && (setDate(d), setTime(null))}
          className="bg-background p-2"
          disabled={[{ before: today }]}
        />

        <div className="flex-1">
          <ScrollArea className="h-64 border-t sm:border-l border-gray-200">
            <div className="p-4 space-y-3">
              <p className="text-sm font-medium">{format(date, "EEEE, MMM d")}</p>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(({ time: ts, available }) => (
                  <Button
                    key={ts}
                    variant={time === ts ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => available && setTime(ts)}
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

      <p className="mt-4 text-center text-sm text-gray-500">
        Selected time: {time || "none"}
      </p>
    </div>
  )
}
