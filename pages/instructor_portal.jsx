
import React, { useState } from 'react'

import Header   from '@/components/Header'
import Footer   from '@/components/Footer'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'

export default function InstructorPortal() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [program, setProgram] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingStatus, setBookingStatus] = useState('') // 'success' or 'error'

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setBookingMessage('Please select a date and time.')
      setBookingStatus('error')
      return
    }

    // Program state is now used directly
    // const program = document.getElementById('coach-program')?.value; 
    const studentName = document.getElementById('coach-student')?.value;
    const price = document.getElementById('coach-price')?.value;

    if (!program) { // Now uses the program state
      setBookingMessage('Please select a program.');
      setBookingStatus('error');
      return;
    }
    
    // Basic validation for student name if program is Private Lesson
    if (program === 'Private Lesson' && !studentName) {
      setBookingMessage('Please enter a student name for private lessons.');
      setBookingStatus('error');
      return;
    }

    setIsBooking(true);
    setBookingMessage('');
    setBookingStatus('');

    let referralSourceValue = null;
    if (program === 'Private Lesson') {
      referralSourceValue = document.getElementById('session-owner-select')?.value || '';
    }

    const payload = {
      date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
      time: selectedTime,
      program: program,
      ...(program === 'Private Lesson' && { student: studentName }),
      lesson_cost: price ? parseFloat(price) : null,
      referral_source: referralSourceValue,
    };

    try {
      const response = await fetch('/api/coach/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // credentials: 'include', // If auth is cookie-based
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        setBookingMessage(responseData.message || 'Lesson booked successfully!');
        setBookingStatus('success');
        // Reset form fields (optional)
        // setSelectedDate(null);
        // setSelectedTime('');
        // document.getElementById('coach-program').value = '';
        // document.getElementById('coach-student').value = '';
        // document.getElementById('coach-price').value = '';
      } else {
        setBookingMessage(responseData.message || 'Failed to book lesson.');
        setBookingStatus('error');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingMessage('An error occurred while booking the lesson.');
      setBookingStatus('error');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex-1 py-10 px-2.5 sm:px-5 max-w-7xl w-[90%] mx-auto bg-white rounded-lg shadow-lg">
        {/* Main content of the portal - REMAINS UNTOUCHED */}
      <section>
        <h2 className="text-brand-blue text-2xl font-semibold mb-6">Your Upcoming Lessons</h2>
        <div id="lessons-cards"></div>
        <h2 className="text-brand-blue text-2xl font-semibold mb-6">Submit Progress Update</h2>
        <form id="progress-form" className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
          <label htmlFor="student-select" className="block font-bold text-brand-blue mb-1">Select Student:</label>
          <select id="student-select" className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="" disabled >Choose a student</option>
          </select>
          <label htmlFor="feedback" className="block font-bold text-brand-blue mb-1 md:col-span-2">Progress Summary:</label>
          <textarea id="feedback" rows="5" placeholder="Write progress notes here..." className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:col-span-2"></textarea>
          <button type="submit" className="bg-brand-blue text-white cursor-pointer inline-block w-auto m-1 py-2.5 px-4 rounded hover:bg-brand-blue-hover text-center md:col-span-2">Submit</button>
        </form>
    
        <h2 className="text-brand-blue text-2xl font-semibold mb-6">Add Lesson</h2>
        <form id="coach-lesson-form" className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="coach-program" className="block font-bold text-brand-blue mb-1">Program</label>
            <select 
              id="coach-program" 
              value={program} 
              onChange={(e) => setProgram(e.target.value)} 
              required
              className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="" disabled >Choose a program</option>
              <option value="Private Lesson">Private Lesson</option>
              <option value="Summer Camp - Day Pass">Summer Camp - Day Pass</option>
              <option value="Summer Camp - Week Pass">Summer Camp - Week Pass</option>
              <option value="Kids Camp - Day Pass">Kids Camp - Day Pass</option>
              <option value="Kids Camp - Week Pass">Kids Camp - Week Pass</option>
            </select>
          </div>
          {program === 'Private Lesson' && (
            <div id="coach-student-container" className="mt-4">
              <label htmlFor="coach-student" className="block font-bold text-brand-blue mb-1">Student Name</label>
              <input type="text" id="coach-student" placeholder="Enter student name" className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          )}
          {program === 'Private Lesson' && (
            <div id="session-owner-container" className="mt-4">
              <label htmlFor="session-owner-select" className="block font-bold text-brand-blue mb-1">Session Owner</label>
              <select id="session-owner-select" className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"> {/* Assuming this select will be controlled or its value read directly */}
                <option value="" disabled>Choose session owner</option>
                {/* Options for session owner would be populated here, possibly from state or props */}
              </select>
            </div>
          )}
          <div className="mt-2.5 md:col-span-2">
            <label htmlFor="coach-date-calendar" className="block font-bold text-brand-blue mb-1">Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
            {selectedDate && <p className="mt-1 text-sm">Selected: {selectedDate.toLocaleDateString()}</p>}
          </div>
          <div className="mt-2.5">
            <label htmlFor="coach-time" className="block font-bold text-brand-blue mb-1">Time</label>
            <select
              id="coach-time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="" disabled>Select a time</option>
              {Array.from({ length: (20 - 8) * 2 + 1 }, (_, i) => { // From 8:00 to 20:00
                const hour = 8 + Math.floor(i / 2);
                const minute = (i % 2) * 30;
                const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                return <option key={timeValue} value={timeValue}>{timeValue}</option>;
              })}
            </select>
          </div>
          <div className="mt-2.5">
            <label htmlFor="coach-price" className="block font-bold text-brand-blue mb-1">Price</label>
            <input type="number" id="coach-price" placeholder="Enter lesson price" className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>

          <button
            type="button"
            onClick={handleBooking}
            disabled={isBooking}
            className="mt-4 w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold py-2.5 px-4 rounded disabled:opacity-50 md:col-span-2"
          >
            {isBooking ? 'Booking...' : 'Book Private Lesson'}
          </button>

          {bookingMessage && (
            <div
              className={`mt-4 p-3 rounded text-center md:col-span-2 ${
                bookingStatus === 'success' ? 'bg-green-100 text-green-700' : ''
              } ${bookingStatus === 'error' ? 'bg-red-100 text-red-700' : ''}`}
            >
              {bookingMessage}
            </div>
          )}
          <button type="submit" className="bg-brand-blue text-white cursor-pointer inline-block w-auto mt-5 py-2.5 px-4 rounded hover:bg-brand-blue-hover text-center md:col-span-2">Add Lesson</button>
        </form>

        <button id="viewFinancesBtn" className="inline-block bg-brand-explore-blue text-white text-base font-normal py-3 px-8 rounded-full shadow-lg hover:bg-brand-blue-hover hover:scale-105 transform transition duration-200 ease-in-out cursor-pointer no-underline text-center mt-8">View My Finances</button>
      </section>
    
      <div className="time-block-section">
      <h3 style={{color: '#0c3c78'}} className="text-brand-blue text-xl font-semibold mb-4">Block Specific Time Slots</h3>
      <form id="time-block-form" className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="form-group">
          <label htmlFor="time-block-date" className="block font-bold text-brand-blue mb-1">Date</label>
         <input type="text" id="time-block-date" placeholder="Select a date" required className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
        </div>
        <div className="form-group">
          <label htmlFor="time-block-start" className="block font-bold text-brand-blue mb-1">Start Time</label>
          <select id="time-block-start" required className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="">-- Select Time --</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="time-block-end" className="block font-bold text-brand-blue mb-1">End Time</label>
          <select id="time-block-end" required className="w-full p-2.5 rounded border border-brand-gray box-border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="">-- Select Time --</option>
          </select>
        </div>
        <button type="submit" className="full-width-button bg-brand-blue text-white cursor-pointer inline-block w-auto m-1 py-2.5 px-4 rounded hover:bg-brand-blue-hover text-center md:col-span-2">Add Time Block</button>
      </form>
    </div>
      <div className="offdays-section">
          <h2 className="text-brand-blue text-2xl font-semibold mb-6">Block Off Days / Times (You Are Unavailable)</h2>
          <div id="coach-availability-calendar" style={{margin: '40px auto', maxWidth: '500px'}} className="md:col-span-2"></div>
          <button id="submit-offdays" style={{display: 'block', margin: '20px auto 0 auto'}} className="bg-brand-blue text-white cursor-pointer inline-block w-auto m-1 py-2.5 px-4 rounded hover:bg-brand-blue-hover text-center">Submit Off-Days</button>
          <small>
            Click on days in the calendar to mark yourself unavailable.<br />
            Blocked days will show a <span style={{color: '#e74c3c', fontWeight: 'bold'}}>❌</span>.<br />
            Click again to unblock. Click "Submit Off-Days" to save.
          </small>
        </div>

    <div id="viewFinancesModal" className="hidden fixed z-[1001] inset-0 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white p-5 border border-brand-gray max-w-[550px] rounded-lg shadow-lg w-full mx-4">
          <div className="py-3 px-4 border-b border-brand-gray flex justify-between items-center bg-brand-blue text-white rounded-t-lg">
              <h4 className="text-lg font-semibold text-white">My Finances</h4>
              <button type="button" className="close-modal-btn text-white hover:text-gray-200 text-2xl font-semibold" aria-label="Close">&times;</button>
          </div>
          <div id="financesModalBody" className="p-5">
              <p>Loading financial data...</p>
          </div>
          <div className="py-3 px-4 border-t border-brand-gray text-right rounded-b-lg">
              <button type="button" className="close-modal-btn bg-brand-blue text-white py-2 px-[18px] rounded hover:bg-brand-blue-hover">Close</button>
          </div>
      </div>
    </div>
    {/* End of main content */}
      </div>
      <Footer />
    </>
  );
};


