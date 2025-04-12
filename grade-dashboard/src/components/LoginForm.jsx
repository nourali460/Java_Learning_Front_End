// src/components/LoginForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { Alert } from 'react-bootstrap';
import { FaUser, FaKey } from 'react-icons/fa';

const API_BASE_URL = 'https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com';

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/admins/validate`, {
        name: username,
        password,
      });
      onLoginSuccess(res.data.token);
    } catch (err) {
      console.error(err);
      setError('Login failed. Check credentials.');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.logo}>
        <img src="/logo.png" alt="App Logo" style={styles.logoImg} />
      </div>
      <div style={styles.title}>Professor Login</div>
      {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={styles.formField}>
          <FaUser style={styles.icon} />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.formField}>
          <FaKey style={styles.icon} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.btn}>Login</button>
      </form>

      <div style={styles.footer}>
        <a href="#">Forget password?</a> or <a href="#">Sign up</a>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '40px 30px 30px',
    backgroundColor: '#ecf0f3',
    borderRadius: '15px',
    boxShadow: '13px 13px 20px #cbced1, -13px -13px 20px #fff',
    textAlign: 'center',
  },
  logo: {
    width: '120px',
    height: '120px',
    margin: '0 auto 20px',
    borderRadius: '50%',
    background: '#fff',
    boxShadow:
      '0px 0px 3px #5f5f5f, 0px 0px 0px 5px #ecf0f3, 8px 8px 15px #a7aaa7, -8px -8px 15px #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '50%',
  },
  
  title: {
    fontWeight: 600,
    fontSize: '1.4rem',
    letterSpacing: '1.3px',
    color: '#555',
    marginBottom: '20px',
  },
  formField: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '10px',
    marginBottom: '20px',
    borderRadius: '20px',
    background: '#ecf0f3',
    boxShadow: 'inset 8px 8px 8px #cbced1, inset -8px -8px 8px #fff',
    overflow: 'hidden',
  },
  icon: {
    color: '#555',
    marginRight: '10px',
  },
  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'none',
    fontSize: '1.1rem',
    color: '#666',
    padding: '10px 15px',
    borderRadius: '20px',
  },
  btn: {
    width: '100%',
    height: '40px',
    backgroundColor: '#03A9F4',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    letterSpacing: '1.3px',
    boxShadow: '3px 3px 3px #b1b1b1, -3px -3px 3px #fff',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '15px',
    fontSize: '0.8rem',
    color: '#03A9F4',
  },
};


export default LoginForm;
