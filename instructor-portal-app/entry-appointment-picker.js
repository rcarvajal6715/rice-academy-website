import React from 'react';
import ReactDOM from 'react-dom';
// Assuming AppointmentPicker.jsx is in instructor-portal-app/components/
import AppointmentPicker from '../../AppointmentPicker.jsx';

export function mountAppointmentPicker(props, containerElement) {
  if (!containerElement) {
    console.error('Mount container element not provided to mountAppointmentPicker.');
    return;
  }
  // Ensure props are passed to AppointmentPicker
  ReactDOM.render(React.createElement(AppointmentPicker, props), containerElement);
}

// Expose the mount function to the global window object
if (typeof window !== 'undefined') {
  window.mountAppointmentPicker = mountAppointmentPicker;
}
