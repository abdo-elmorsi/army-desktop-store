import { useState, useEffect } from 'react';

/**
 * Custom hook to manage user authentication status and retrieve user data from localStorage.
 * @returns {object} An object containing:
 * - `user`: The user data if available, otherwise null.
 * - `isAuthenticated`: A boolean indicating whether the user is authenticated.
 * - `isLoading`: A boolean indicating whether the user data is still being loaded.
 */
const useLocalStorageUser = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initialize loading state as true

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        // Parse the stored user data
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    
    // Set loading to false once the data is checked
    setIsLoading(false);
  }, []);

  return { user, isAuthenticated, isLoading };
};

export default useLocalStorageUser;
