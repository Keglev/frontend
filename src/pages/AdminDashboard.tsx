import React from 'react';

const AdminDashboard: React.FC = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; // Redirect to login after logout
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg text-gray-700 mb-6">
        Welcome, Admin! Here you can manage all the products.
      </p>
      <button
        onClick={handleLogout}
        className="px-6 py-3 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
