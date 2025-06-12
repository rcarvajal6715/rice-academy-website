import React, { useState } from 'react';
import AppointmentPicker from '../components/AppointmentPicker';
// import { cn } from '../rice-academy-app/src/lib/utils'; // cn might not be needed yet
// import { Calendar } from '@/components/ui/calendar'; // No longer directly used here
import Header from '@/components/Header'
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const InstructorPortal = () => {
  // const [selectedDate, setSelectedDate] = useState(null); // Replaced by hiddenDate/hiddenTime logic
  // const [selectedTime, setSelectedTime] = useState(''); // Replaced by hiddenDate/hiddenTime logic
  const [program, setProgram] = useState(''); // New state for program
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingStatus, setBookingStatus] = useState(''); // 'success' or 'error'
  const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
  const [hiddenDate, setHiddenDate] = useState('');
  const [hiddenTime, setHiddenTime] = useState('');
  // const [pickedDateObject, setPickedDateObject] = useState(null); // If needed for display beyond the new p tag
  // const [pickedTimeValue, setPickedTimeValue] = useState(''); // If needed for display beyond the new p tag


  const handleBooking = async () => {
    if (!hiddenDate || !hiddenTime) {
      setBookingMessage('Please select a date and time.');
      setBookingStatus('error');
      return;
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
      date: hiddenDate, // YYYY-MM-DD
      time: hiddenTime,
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
          <input type="hidden" id="coach-date" name="coach-date" value={hiddenDate} />
          <input type="hidden" id="coach-time" name="coach-time" value={hiddenTime} />
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
          <div style={{ marginTop: '10px' }}>
            <Button
              type="button" // Important: type="button" to prevent form submission
              onClick={() => setShowAppointmentPicker(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white" // Example Tailwind classes
            >
              Pick Date & Time
            </Button>
            {(hiddenDate && hiddenTime) && (
              <p className="mt-2 text-sm text-gray-600">Selected: {new Date(hiddenDate + 'T' + hiddenTime).toLocaleString()}</p>
            )}
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
      {showAppointmentPicker && (
        <AppointmentPicker
          onDateTimeChange={(isoDate, timeStr) => {
            setHiddenDate(isoDate);
            setHiddenTime(timeStr);
            // Optionally, update pickedDateObject and pickedTimeValue if still needed elsewhere
            // For example, if you want to display the selected date/time immediately in a human-readable format
            // For now, we'll directly use isoDate and timeStr for the hidden fields
            setShowAppointmentPicker(false);
          }}
          onClose={() => setShowAppointmentPicker(false)}
        />
      )}
    </>
  );
};

export default InstructorPortal;

