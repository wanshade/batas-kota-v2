"use client"

import * as React from "react"
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface DateScrollerProps {
  selectedDate: string
  onDateSelect: (date: string) => void
}

// Helper function to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DateScroller({ selectedDate, onDateSelect }: DateScrollerProps) {
  const [dates, setDates] = React.useState<Date[]>([])
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  React.useEffect(() => {
    const today = new Date()
    const futureDates = Array.from({ length: 3 }, (_, i) => addDays(today, i))
    setDates(futureDates)
  }, [])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    return eachDayOfInterval({ start, end })
  }

  const monthDays = getDaysInMonth(currentMonth)

  return (
    <div className="flex space-x-2">
      {dates.map((date) => {
        const dateString = getLocalDateString(date)
        const isSelected = dateString === selectedDate

        return (
          <button
            key={dateString}
            onClick={() => onDateSelect(dateString)}
            className={cn(
              "flex flex-col items-center justify-center w-16 p-3 rounded-xl transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "bg-white border border-gray-200 hover:border-primary hover:shadow-md hover:scale-105"
            )}
          >
            <span className="text-xs font-medium">
              {format(date, "EEE")}
            </span>
            <span className="text-xl font-bold mt-1">
              {format(date, "d")}
            </span>
          </button>
        )
      })}

      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <CalendarIcon className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="bg-white rounded-xl shadow-xl border-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-gray-900">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for alignment */}
                {Array.from({ length: monthDays[0].getDay() }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Month days */}
                {monthDays.map((day) => {
                  const isSelected = isSameDay(day, new Date(selectedDate))
                  const isToday = isSameDay(day, new Date())

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        onDateSelect(getLocalDateString(day))
                        setIsDatePickerOpen(false)
                      }}
                      className={cn(
                        "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                        isSelected && "bg-primary text-white shadow-md",
                        isToday && !isSelected && "bg-primary/10 text-primary font-semibold",
                        !isSelected && !isToday && "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-500">
                {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  onDateSelect(getLocalDateString(new Date()))
                  setCurrentMonth(new Date())
                  setIsDatePickerOpen(false)
                }}
                className="h-8 text-xs"
              >
                Today
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
