import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

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
      onLoginSuccess(res.data.token); // Pass token to parent
    } catch (err) {
      console.error(err);
      setError('Login failed. Check credentials.');
    }
  };

  return (
    <Card className="p-4 shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
      <h3 className="text-center text-primary mb-3">Professor Login</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">
          Login
        </Button>
      </Form>
    </Card>
  );
}


export default LoginForm;
