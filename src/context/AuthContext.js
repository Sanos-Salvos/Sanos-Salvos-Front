import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('USER');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole') || 'USER';
    const email = localStorage.getItem('userEmail') || '';

    if (logged) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserEmail(email);
    }
  }, []);

  const login = (emailOrUsername, passwordOrRole, maybeIsOrg, maybeOrgName) => {
    console.log("-> Ejecutando función login en AuthContext:", { emailOrUsername, passwordOrRole, maybeIsOrg, maybeOrgName });

    let roleToSet = 'USER';

    if (typeof passwordOrRole === 'string' && (passwordOrRole === 'USER' || passwordOrRole === 'ADMIN_ORGANIZACION' || passwordOrRole === 'ADMIN_ORG')) {
      roleToSet = passwordOrRole;
    } else if (maybeIsOrg === true || passwordOrRole === true) {
      roleToSet = 'ADMIN_ORGANIZACION';
    } else if (emailOrUsername && (emailOrUsername.includes('admin') || emailOrUsername === 'admin')) {
      roleToSet = 'ADMIN_ORGANIZACION';
    }

    if (roleToSet === 'ADMIN_ORG') roleToSet = 'ADMIN_ORGANIZACION';

    setIsLoggedIn(true);
    setUserRole(roleToSet);
    setUserEmail(emailOrUsername || 'usuario@correo.com');

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', roleToSet);
    localStorage.setItem('userEmail', emailOrUsername || '');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole('USER');
    setUserEmail('');
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userRole, setUserRole, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};