// src/App.js
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import ManageStudents from "./components/ManageStudents";
import NavigationBar from "./components/NavigationBar";
import { decodeToken } from "./utils";
import StudentEnrollment from "./components/StudentEnrollment";
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {
  const [token, setToken] = useState(localStorage.getItem("jwt") || "");
  const [adminName, setAdminName] = useState("");
  const [currentView, setCurrentView] = useState(localStorage.getItem("currentView") || "dashboard");

  const handleLoginSuccess = (jwt) => {
    localStorage.setItem("jwt", jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("currentView");
    setToken("");
    setAdminName("");
    setCurrentView("dashboard");
  };

  useEffect(() => {
    if (token) {
      try {
        const { sub } = decodeToken(token);
        if (sub) {
          setAdminName(sub);
        } else {
          handleLogout();
        }
      } catch {
        handleLogout();
      }
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem("currentView", currentView);
  }, [currentView]);

  const styles = {
    splitWrapper: {
      display: 'flex',
      flexDirection: 'row',
      gap: '40px',
      justifyContent: 'center',
      alignItems: 'stretch', // 🔥 Ensures both panels are same height
      flexWrap: 'wrap',
    },
    leftPane: {
      flex: 1,
      minWidth: '370px',
      maxWidth: '450px',
    },
    rightPane: {
      flex: 1,
      minWidth: '370px',
      maxWidth: '450px',
    },
  };

  return (
    <>
      {!token ? (
        <Container className="my-5">
          <div style={styles.splitWrapper}>
            <div style={styles.leftPane}>
              <StudentEnrollment />
            </div>
            <div style={styles.rightPane}>
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </div>
          </div>
        </Container>
      ) : (
        <>
          <NavigationBar
            onLogout={handleLogout}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
          <Container className="my-4">
            {currentView === "dashboard" && (
              <Dashboard token={token} adminName={adminName} />
            )}
            {currentView === "manage" && (
              <ManageStudents token={token} />
            )}
          </Container>
        </>
      )}
    </>
  );
}

export default App;
