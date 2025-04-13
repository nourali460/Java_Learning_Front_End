import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = 'https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com';

const SEMESTER_OPTIONS = [
  'FALL 2025', 'SPRING 2026', 'SUMMER 2026', 'FALL 2026',
  'SPRING 2027', 'SUMMER 2027', 'FALL 2027',
  'SPRING 2028', 'SUMMER 2028', 'FALL 2028'
];

const COURSE_OPTIONS = [
  'Intro_to_Java', 'IntermediateJava', 'Intro_to_C++',
  'IntermediateC++', 'Data_Structures_in_Java', 'Data_Structures_in_C++'
];

function formatCourseLabel(courseValue) {
  return courseValue.replace(/_/g, ' ');
}

function getAdminFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return '';
  }
}

function ManageStudents({ token }) {
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [newStudent, setNewStudent] = useState({ id: '', email: '' });
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchEnrolledStudents = async () => {
    const admin = getAdminFromToken(token);
    if (!admin || !course || !semester) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/admins/students/passwords`, {
        params: { admin, course, semesterId: semester },
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (err) {
      console.error('❌ Failed to fetch enrolled students:', err);
    }
  };

  useEffect(() => {
    fetchEnrolledStudents();
  }, [course, semester]);

  const handleAddStudent = async () => {
    setError('');
    setSuccessMessage('');

    if (!newStudent.id.match(/^[a-zA-Z]+_\d+$/)) {
      setError("❌ Student ID must follow format: firstname_idnumber (e.g., alice_12345)");
      return;
    }

    if (!newStudent.id || !newStudent.email || !semester || !course) {
      setError('⚠️ All fields are required.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/students/add`, {
        id: newStudent.id,
        email: newStudent.email,
        password: '',
        course,
        semesterId: semester
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewStudent({ id: '', email: '' });
      setSuccessMessage(`✅ Student "${newStudent.id}" added successfully.`);
      fetchEnrolledStudents();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('⛔ Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('jwt');
          window.location.href = '/';
        }, 2000);
      } else if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else {
        setError('❌ Failed to add student. They might already be enrolled.');
      }
      console.error(err);
    }
  };

  const handleCopy = (student) => {
    const text = `Student ID: ${student.id}\nEmail: ${student.email}\nPassword: ${student.hashedPassword}`;
    navigator.clipboard.writeText(text)
      .then(() => alert('✅ Copied to clipboard'))
      .catch(() => alert('❌ Failed to copy'));
  };

  const handleDownloadCSV = () => {
    if (!students.length) return;

    const headers = ['Student ID', 'Email', 'Password'];
    const rows = students.map(s => [s.id, s.email, s.hashedPassword]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `enrolled-students-${course}-${semester}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="mb-4 text-primary">Manage Students</h2>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Select Semester</Form.Label>
          <Form.Select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">-- Choose Semester --</option>
            {SEMESTER_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Label>Select Course</Form.Label>
          <Form.Select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            disabled={!semester}
          >
            <option value="">-- Choose Course --</option>
            {COURSE_OPTIONS.map(c => (
              <option key={c} value={c}>{formatCourseLabel(c)}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {semester && course && (
        <>
          <h5 className="mt-4">Add Student</h5>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Table bordered hover className="mt-2">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Email</th>
                <th>Password</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Form.Control
                    type="text"
                    value={newStudent.id}
                    onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
                    placeholder="student123"
                  />
                </td>
                <td>
                  <Form.Control
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                </td>
                <td>
                  <Form.Control type="text" value="Auto-generated" disabled />
                </td>
                <td>
                  <Button variant="success" onClick={handleAddStudent}>Add</Button>
                </td>
              </tr>
            </tbody>
          </Table>

          {students.length > 0 && (
            <>
              <h5 className="mt-4">
                Students Enrolled in {formatCourseLabel(course)} ({semester})
              </h5>
              <Button variant="outline-primary" size="sm" className="mb-2" onClick={handleDownloadCSV}>
                📥 Download CSV
              </Button>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Copy</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={idx}>
                      <td>{s.id}</td>
                      <td>{s.email}</td>
                      <td><code>{s.hashedPassword || 'N/A'}</code></td>
                      <td>
                        <Button variant="outline-secondary" size="sm" onClick={() => handleCopy(s)}>
                          📋 Copy
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </>
      )}
    </Card>
  );
}

export default ManageStudents;