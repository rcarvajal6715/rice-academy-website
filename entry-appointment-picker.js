
import React from 'react';
import ReactDOM from 'react-dom';
// Assuming AppointmentPicker.jsx is in instructor-portal-app/components/
import AppointmentPicker from "./AppointmentPicker.jsx";

export function mountAppointmentPicker(containerElementId, props) { // Changed signature
  const container = document.getElementById(containerElementId); // Get element by ID
  if (!container) { // Check if container was found
    console.error(`Mount container element with ID '${containerElementId}' not found.`);
    return;
  }
  // Ensure props are passed to AppointmentPicker, and container is the actual DOM element
  ReactDOM.render(React.createElement(AppointmentPicker, props), container);
}

// Expose the mount function to the global window object
if (typeof window !== 'undefined') {
  window.mountAppointmentPicker = mountAppointmentPicker;
}
