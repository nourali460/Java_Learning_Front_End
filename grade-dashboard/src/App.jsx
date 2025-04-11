import React, { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { Container } from 'react-bootstrap';
import { decodeToken } from './utils';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt') || '');
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    if (token) {
      try {
        const { sub } = decodeToken(token);
        setAdminName(sub);
      } catch (err) {
        console.error('Invalid token:', err);
        handleLogout();
      }
    }
  }, [token]);

  const handleLoginSuccess = (jwt) => {
    localStorage.setItem('jwt', jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setToken('');
    setAdminName('');
  };

  return (
    <Container className="my-5">
      {!token ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard token={token} adminName={adminName} onLogout={handleLogout} />
      )}
    </Container>
  );
}

export default App;
