import '../styles/globals.css'
import React, { useState } from 'react'

import Header   from '../components/Header'
import Footer   from '../components/Footer'
import { Calendar } from '../components/ui/calendar'
import { Button }   from '../components/ui/button'


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
      <div>
        {/* Main content of the portal - REMAINS UNTOUCHED */}
      <section>
        <h2>Your Upcoming Lessons</h2>
        <div id="lessons-cards"></div>
        <h2>Submit Progress Update</h2>
        <form id="progress-form">
          <label htmlFor="student-select">Select Student:</label>
          <select id="student-select">
            <option value="" disabled >Choose a student</option>
          </select>
          <label htmlFor="feedback">Progress Summary:</label>
          <textarea id="feedback" rows="5" placeholder="Write progress notes here..."></textarea>
          <button type="submit">Submit</button>
        </form>
    
        <h2>Add Lesson</h2>
        <form id="coach-lesson-form">
          <div>
            <label htmlFor="coach-program">Program</label>
            <select 
              id="coach-program" 
              value={program} 
              onChange={(e) => setProgram(e.target.value)} 
              required
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
              <label htmlFor="coach-student">Student Name</label>
              <input type="text" id="coach-student" placeholder="Enter student name" />
            </div>
          )}
          {program === 'Private Lesson' && (
            <div id="session-owner-container" className="mt-4">
              <label htmlFor="session-owner-select">Session Owner</label>
              <select id="session-owner-select"> {/* Assuming this select will be controlled or its value read directly */}
                <option value="" disabled>Choose session owner</option>
                {/* Options for session owner would be populated here, possibly from state or props */}
              </select>
            </div>
          )}
          <div style={{marginTop: '10px'}}>
            <label htmlFor="coach-date-calendar" className="block mb-1 font-medium">Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
            {selectedDate && <p className="mt-1 text-sm">Selected: {selectedDate.toLocaleDateString()}</p>}
          </div>
          <div style={{marginTop: '10px'}}>
            <label htmlFor="coach-time" className="block mb-1 font-medium">Time</label>
            <select
              id="coach-time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
          <div style={{marginTop: '10px'}}>
            <label htmlFor="coach-price">Price</label>
            <input type="number" id="coach-price" placeholder="Enter lesson price" />
          </div>

          <button
            type="button"
            onClick={handleBooking}
            disabled={isBooking}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isBooking ? 'Booking...' : 'Book Private Lesson'}
          </button>

          {bookingMessage && (
            <div
              className={`mt-4 p-3 rounded text-center ${
                bookingStatus === 'success' ? 'bg-green-100 text-green-700' : ''
              } ${bookingStatus === 'error' ? 'bg-red-100 text-red-700' : ''}`}
            >
              {bookingMessage}
            </div>
          )}
          <button type="submit" style={{marginTop: '20px'}}>Add Lesson</button>
        </form>

        <button id="viewFinancesBtn">View My Finances</button>
      </section>
    
      <div className="time-block-section">
      <h3 style={{color: '#0c3c78'}}>Block Specific Time Slots</h3>
      <form id="time-block-form">
        <div className="form-group">
          <label htmlFor="time-block-date">Date</label>
         <input type="text" id="time-block-date" placeholder="Select a date" required />
        </div>
        <div className="form-group">
          <label htmlFor="time-block-start">Start Time</label>
          <select id="time-block-start" required>
            <option value="">-- Select Time --</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="time-block-end">End Time</label>
          <select id="time-block-end" required>
            <option value="">-- Select Time --</option>
          </select>
        </div>
        <button type="submit" className="full-width-button">Add Time Block</button>
      </form>
    </div>
      <div className="offdays-section">
          <h2>Block Off Days / Times (You Are Unavailable)</h2>
          <div id="coach-availability-calendar" style={{margin: '40px auto', maxWidth: '500px'}}></div>
          <button id="submit-offdays" style={{display: 'block', margin: '20px auto 0 auto'}}>Submit Off-Days</button>
          <small>
            Click on days in the calendar to mark yourself unavailable.<br />
            Blocked days will show a <span style={{color: '#e74c3c', fontWeight: 'bold'}}>❌</span>.<br />
            Click again to unblock. Click "Submit Off-Days" to save.
          </small>
        </div>

    <div id="viewFinancesModal" className="modal" style={{display: 'none'}}>
      <div className="modal-content" style={{maxWidth: '550px'}}>
          <div style={{padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4 style={{margin: '0', fontSize: '1.2em', color: '#0c3c78'}}>My Finances</h4>
              <button type="button" className="close-modal-btn" aria-label="Close" style={{background: 'transparent', border: 'none', fontSize: '1.6em', cursor: 'pointer', color: '#777', padding: '0'}}>&times;</button>
          </div>
          <div id="financesModalBody" style={{padding: '20px'}}>
              <p>Loading financial data...</p>
          </div>
          <div style={{padding: '15px 20px', borderTop: '1px solid #ddd', textAlign: 'right'}}>
              <button type="button" className="close-modal-btn" style={{padding: '8px 18px', backgroundColor: '#0c3c78', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Close</button>
          </div>
      </div>
    </div>
    {/* End of main content */}
      </div>
      <Footer />
    </>
  );
};


