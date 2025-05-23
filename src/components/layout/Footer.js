import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component for the application
 * @returns {JSX.Element} Footer component
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-lg font-semibold">Finance News</p>
            <p className="text-sm text-gray-300">
              Your source for the latest financial news
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white">
              Home
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white">
              About
            </Link>
            <Link to="/privacy" className="text-gray-300 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>© {currentYear} Finance News. All rights reserved.</p>
          <p className="mt-2">
            This is a Progressive Web Application built with React and Firebase.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;