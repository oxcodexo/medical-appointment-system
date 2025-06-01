import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Unauthorized page displayed when a user attempts to access a resource they don't have permission for
 */
const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-200"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition duration-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
