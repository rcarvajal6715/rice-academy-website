import React from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

/**
 * A simple wrapper around react-day-picker’s DayPicker.
 * Accepts all DayPicker props, plus:
 *  - mode="single"
 *  - selected (JS Date)
 *  - onSelect (handler)
 */
export function Calendar(props) {
  return <DayPicker {...props} />
}
