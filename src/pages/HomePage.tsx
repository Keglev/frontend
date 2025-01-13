import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || !role) {
        console.warn("No token or role found. Redirecting to login.");
        navigate('/login'); // Redirect to login if no credentials
        return;
      }

      // Debugging logs
      console.info("Token found:", token);
      console.info("Role found:", role);

      // Redirect based on role
      if (role === 'ROLE_ADMIN') {
        console.info("Redirecting to admin dashboard.");
        navigate('/admin-dashboard');
      } else if (role === 'ROLE_USER') {
        console.info("Redirecting to user dashboard.");
        navigate('/user-dashboard');
      } else {
        console.warn("Unknown role. Redirecting to login.");
        navigate('/login');
      }
    } catch (error) {
      console.error("Error in HomePage redirection:", error);
      navigate('/login'); // Fallback to login
    }
  }, [navigate]);

  return <div>Loading...</div>; // Display loading while deciding redirection
};

export default HomePage;


