import React from 'react';
import Link from 'next/link'; // Using Next.js Link for client-side navigation

const Header = () => {
  // Basic state for mobile menu toggle, actual implementation might vary
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Helper for conditional classNames
  const mobileMenuContainerClasses = isMobileMenuOpen ? "block" : "hidden";

  return (
    <>
      {/* Header Section */}
      <header className="bg-[#0c3c78] text-white py-[15px] md:py-[30px] px-[20px] relative text-center">
        <div className="flex items-center justify-between md:justify-center max-w-[1200px] mx-auto relative w-full">
          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden bg-transparent border-none text-white text-[28px] cursor-pointer p-[5px]"
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <>&times;</> : <>&#9776;</>}
          </button>

          {/* Site Title */}
          <div className="text-center flex-grow md:ml-0 md:mr-0 mx-auto md:mx-0"> {/* Adjusted for flex layout, mx-auto centers it when button is present */}
            <h1 className="text-lg md:text-2xl font-bold my-0 text-white">
              <Link href="/">C2 Tennis Academy</Link>
            </h1>
            <p className="text-sm md:text-base my-0 text-[#f0f0f0] hidden md:block">
              {/* Subtitle can be dynamic if needed */}
              Your Tennis Journey Starts Here 
            </p>
          </div>

          {/* Desktop Authentication Buttons Placeholder */}
          <div id="authContainerDesktop" className="hidden md:flex items-center absolute top-1/2 right-[0px] transform -translate-y-1/2">
            {/* Example: <button className="bg-white text-[#0c3c78] border-none py-2 px-4 ml-2 rounded font-bold cursor-pointer transition-all hover:bg-[#0f4fa0] hover:text-white">Login</button> */}
          </div>
        </div>
      </header>

      {/* Navigation Section */}
      {/* Main navigation bar for desktop */}
      <nav className="main-navigation bg-[#092e5e] hidden md:block">
        <div className="flex justify-center items-center w-full max-w-[1200px] mx-auto px-[20px]">
          <ul className="list-none m-0 p-0 flex space-x-1">
            <li><Link href="/" className="text-white py-[14px] px-[20px] no-underline block rounded-full hover:bg-[#0f4fa0]">Home</Link></li>
            <li><Link href="/about" className="text-white py-[14px] px-[20px] no-underline block rounded-full hover:bg-[#0f4fa0]">About</Link></li>
            <li><Link href="/programs" className="text-white py-[14px] px-[20px] no-underline block rounded-full hover:bg-[#0f4fa0]">Programs</Link></li>
            <li><Link href="/schedule" className="text-white py-[14px] px-[20px] no-underline block rounded-full hover:bg-[#0f4fa0]">Schedule</Link></li>
            <li><Link href="/contact" className="text-white py-[14px] px-[20px] no-underline block rounded-full hover:bg-[#0f4fa0]">Contact</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Menu (Flyout) */}
      <div className={`mobile-menu-container md:hidden fixed top-0 left-0 w-full h-full bg-[#092e5e] z-[1000] pt-[20px] box-border overflow-y-auto text-center ${mobileMenuContainerClasses}`}>
        <button
          className="block absolute top-[15px] right-[20px] bg-transparent border-none text-white text-[28px] cursor-pointer"
          aria-label="Close navigation menu"
          onClick={toggleMobileMenu}
        >
          &times;
        </button>
        
        {/* Mobile Authentication Buttons Placeholder */}
        <div id="authContainerMobile" className="p-[20px]">
          {/* Example: <button className="bg-[#d8f352] text-[#0c3c78] border-none py-3 px-5 rounded font-bold cursor-pointer block w-4/5 max-w-[250px] my-2 mx-auto box-border hover:bg-[#c1da3b]">Login</button> */}
        </div>

        <ul className="list-none p-0 my-[20px] mx-0">
          <li><Link href="/" className="text-white py-[15px] px-[20px] no-underline block border-b border-[#0c3c78] rounded-full hover:bg-[#0f4fa0]" onClick={toggleMobileMenu}>Home</Link></li>
          <li><Link href="/instructor-portal" className="text-white py-[15px] px-[20px] no-underline block border-b border-[#0c3c78] rounded-full hover:bg-[#0f4fa0]" onClick={toggleMobileMenu}>Instructor Portal</Link></li>
          <li><Link href="/booking" className="text-white py-[15px] px-[20px] no-underline block border-b border-[#0c3c78] rounded-full hover:bg-[#0f4fa0]" onClick={toggleMobileMenu}>Book a Session</Link></li>
          <li><Link href="/about" className="text-white py-[15px] px-[20px] no-underline block border-b border-[#0c3c78] rounded-full hover:bg-[#0f4fa0]" onClick={toggleMobileMenu}>About</Link></li>
          <li><Link href="/programs" className="text-white py-[15px] px-[20px] no-underline block border-b border-[#0c3c78] rounded-full hover:bg-[#0f4fa0]" onClick={toggleMobileMenu}>Programs</Link></li>
          <li><Link href="/schedule" className="text-white py-[15px] px-[20px] no-underline block border-b border-[#0c3c78] rounded-full hover:bg-[#0f4fa0]" onClick={toggleMobileMenu}>Schedule</Link></li>
          <li><Link href="/contact" className="text-white py-[15px] px-[20px] no-underline block rounded-full hover:bg-[#0f4fa0] last:border-b-0" onClick={toggleMobileMenu}>Contact</Link></li>
        </ul>
      </div>
    </>
  );
};

export default Header;
