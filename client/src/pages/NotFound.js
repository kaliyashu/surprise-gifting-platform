import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😅</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="bg-pink-500 text-white px-8 py-4 rounded-lg hover:bg-pink-600 transition-colors text-lg inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
