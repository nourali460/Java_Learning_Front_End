import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function NavigationBar({ onLogout, currentView, setCurrentView }) {
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>Grade Dashboard</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link
              active={currentView === "dashboard"}
              onClick={() => setCurrentView("dashboard")}
            >
              Home
            </Nav.Link>
            <Nav.Link
              active={currentView === "manage"}
              onClick={() => setCurrentView("manage")}
            >
              Manage Students
            </Nav.Link>
          </Nav>
          <Button variant="outline-light" onClick={onLogout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
