import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password, isOrg, orgName, token) => {
    // Si es organización guardamos sus datos extendidos, si no, usuario común
    const userData = {
      email,
      role: isOrg ? 'ORGANIZATION' : 'USER',
      orgName: isOrg ? orgName : null,
      token: token || 'jwt-mock-token-12345'
    };
    setUser(userData);
    localStorage.setItem('pet_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pet_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);