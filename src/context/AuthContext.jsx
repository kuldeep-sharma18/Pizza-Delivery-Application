import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Mock user database
const MOCK_USERS = [
  { email: 'admin@pizzapalace.com', password: 'admin123', isAdmin: true },
  { email: 'user@example.com', password: 'user123', isAdmin: false }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('pizzaUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.isAdmin || false);
    }
    setLoading(false);
  }, []);

  const signup = async (email, password) => {
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser = { email, password, isAdmin: false };
    MOCK_USERS.push(newUser);
    
    // Store in localStorage
    const userToStore = { email, isAdmin: false };
    localStorage.setItem('pizzaUser', JSON.stringify(userToStore));
    setUser(userToStore);
    setIsAdmin(false);
    
    return { user: userToStore };
  };

  const login = async (email, password) => {
    // Find user in mock database
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }
    
    // Store in localStorage
    const userToStore = { email: foundUser.email, isAdmin: foundUser.isAdmin };
    localStorage.setItem('pizzaUser', JSON.stringify(userToStore));
    setUser(userToStore);
    setIsAdmin(foundUser.isAdmin);
    
    return { user: userToStore };
  };

  const logout = async () => {
    localStorage.removeItem('pizzaUser');
    setUser(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email) => {
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (!foundUser) {
      throw new Error('User not found');
    }
    // In a real app, this would send an email
    console.log(`Password reset requested for ${email}`);
  };

  const value = {
    user,
    loading,
    isAdmin,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
