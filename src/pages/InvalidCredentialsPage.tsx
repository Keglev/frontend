import React from 'react';
import { useNavigate } from 'react-router-dom';

const InvalidCredentialsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Invalid Username or Password</h1>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go Back to Login
      </button>
    </div>
  );
};

export default InvalidCredentialsPage;

