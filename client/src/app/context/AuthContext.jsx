import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('hostal_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hostal_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); 
  }, []);

  const login = async (email, password) => {
    const inputEmail = typeof email === 'object' ? email.email : email;
    const inputPassword = typeof email === 'object' ? email.password : password;

    if (inputEmail === 'admin@hostal.com' && inputPassword === 'admin123') {
      const mockUser = {
        name: 'Administrador José Luis',
        email: 'admin@hostal.com',
        role: 'admin',
        token: 'mock-jwt-token-for-f5'
      };
      
      localStorage.setItem('hostal_user', JSON.stringify(mockUser));
      localStorage.setItem('hostal_token', mockUser.token);
      setUser(mockUser);
      return mockUser; 
    } else {
      throw new Error('Credenciales incorrectas');
    }
  };

  const logout = () => {
    localStorage.removeItem('hostal_user');
    localStorage.removeItem('hostal_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isAuthenticated: !!user, 
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);