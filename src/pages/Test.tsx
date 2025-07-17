import React from 'react';

const Test: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600 mb-8">This is a simple test page to verify routing works.</p>
        <div className="space-y-2">
          <p><strong>Current URL:</strong> {window.location.href}</p>
          <p><strong>Pathname:</strong> {window.location.pathname}</p>
          <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
        </div>
        <div className="mt-8">
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            Go back to home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Test;
