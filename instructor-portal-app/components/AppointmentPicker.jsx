import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

const AppointmentPicker = ({ onDateTimeChange, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const timeSlots = Array.from({ length: (20 - 8) * 2 + 1 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onDateTimeChange(selectedDate.toISOString().split('T')[0], selectedTime);
    } else {
      alert('Please select a date and time.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        minWidth: '300px',
      }}>
        <h2 className="text-lg font-semibold mb-4">Select Date and Time</h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          className="rounded-md border mb-4"
        />
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">Select Time Slot</h3>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map(time => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => setSelectedTime(time)}
                className="m-1"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPicker;
