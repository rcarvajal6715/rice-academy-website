// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0c3c78] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Contact Details */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-2">
            <li>
              <a href="tel:+16827022027" className="hover:underline transition">
                Phone: 682-702-2027
              </a>
            </li>
            <li>
              <a href="mailto:c2tennisacademy@gmail.com" className="hover:underline transition">
                Email: c2tennisacademy@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {['Home', 'About', 'Programs', 'Schedule', 'Contact', 'Book'].map(link => (
              <li key={link}>
                <a href={`/${link.toLowerCase()}`} className="hover:underline transition capitalize">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media Icons */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white hover:text-blue-200 transition"
            >
              {/* SVG icon as you already have */}
              …instagram svg…
            </a>
            {/* Facebook */}
            <a
              href="https://www.facebook.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white hover:text-blue-200 transition"
            >
              …facebook svg…
            </a>
          </div>
        </div>

        {/* Copyright & Branding */}
        <div>
          <p className="text-sm leading-relaxed">
            © 2025 C2 Tennis Academy. All Rights Reserved.
          </p>
          <p className="mt-2 text-xs text-gray-300">
            Developing Champions On & Off the Court
          </p>
        </div>
      </div>
    </footer>
  );
}
