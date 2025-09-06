import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
        <footer className="bg-gray-900 text-white py-12" aria-label="Site Footer">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🎉</span>
              <span className="text-xl font-bold">Surprise Moments</span>
            </div>
            <p className="text-gray-300 mb-4">
              Create unforgettable moments with personalized surprises for your loved ones.
              Make every celebration special with our easy-to-use platform.
            </p>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit our Facebook page"
                    className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-colors"
                  >
                    📘 Facebook
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit our Twitter profile"
                    className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded transition-colors"
                  >
                    🐦 Twitter
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit our Instagram profile"
                    className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 rounded transition-colors"
                  >
                    📷 Instagram
                  </a>
                </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-gray-300 hover:text-white transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-gray-300">
            © 2024 Surprise Moments. All rights reserved. Made with ❤️ for creating magical moments.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
