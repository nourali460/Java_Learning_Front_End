import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = 'https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com';

const SEMESTER_OPTIONS = [
  'FALL 2025', 'SPRING 2026', 'SUMMER 2026', 'FALL 2026',
  'SPRING 2027', 'SUMMER 2027', 'FALL 2027',
  'SPRING 2028', 'SUMMER 2028', 'FALL 2028'
];

const COURSE_OPTIONS = [
  { label: 'Intro to Java', value: 'IntrotoJava' },
  { label: 'Intermediate Java', value: 'IntermediateJava' },
  { label: 'Intro to C++', value: 'IntrotoC++' },
  { label: 'Intermediate C++', value: 'IntermediateCpp' },
  { label: 'Data structures in Java', value: 'DataStructuresinJava' },
  { label: 'Data structures in C++', value: 'DataStructuresC++' }
];

function StudentEnrollment() {
  const [adminId, setAdminId] = useState('');
  const [adminVerified, setAdminVerified] = useState(false);
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [student, setStudent] = useState({ id: '', email: '' });
  const [enrolledStudent, setEnrolledStudent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const verifyAdmin = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`${API_BASE_URL}/admins/contains`, { name: adminId });
      if (response.data.exists) {
        setAdminVerified(true);
        setSuccess(`✅ Professor "${adminId}" verified.`);
      } else {
        setError(`❌ Professor ID "${adminId}" not found.`);
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Couldn't verify professor.");
    }
  };

  const handleEnrollment = async () => {
    setError('');
    setSuccess('');
    setEnrolledStudent(null);

    if (!student.id.match(/^[a-zA-Z]+_\d+$/)) {
      setError("❌ Student ID must follow format: firstname_idnumber (e.g., alice_12345)");
      return;
    }

    if (!student.id || !student.email || !semester || !course) {
      setError("❌ All fields are required.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/students/add`, {
        id: student.id,
        email: student.email,
        password: '',
        admin: adminId,
        course,
        semesterId: semester
      });

      setEnrolledStudent({
        id: response.data.studentId,
        email: response.data.email,
        password: response.data.password
      });

      setSuccess(`✅ Student "${student.id}" enrolled successfully.`);
      setStudent({ id: '', email: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Failed to enroll student.");
    }
  };

  return (
    <Card className="p-2 mt-2 shadow-sm" style={{ fontSize: '0.9rem' }}>
      <h6 className="text-primary fw-semibold mb-2" style={{ fontSize: '0.95rem' }}>
        Student Enrollment (No Login Required)
      </h6>

      {!adminVerified ? (
        <>
          <Form.Label className="mb-1" style={{ fontSize: '0.85rem' }}>
            Enter Professor ID
          </Form.Label>
          <Row className="align-items-center g-2 mb-2">
            <Col sm={8}>
              <Form.Control
                type="text"
                size="sm"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="e.g., firstname_ID"
              />
            </Col>
            <Col sm="auto">
              <Button
                size="sm"
                variant="primary"
                style={{ height: '30px', padding: '0 10px', fontSize: '0.75rem' }}
                onClick={verifyAdmin}
              >
                Verify
              </Button>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Alert variant="success" className="py-2 mb-2">
            ✅ Professor <strong>{adminId}</strong> verified.
          </Alert>

          {error && <Alert variant="danger" className="py-2 mb-2">{error}</Alert>}
          {success && <Alert variant="success" className="py-2 mb-2">{success}</Alert>}

          <Row className="mb-2">
            <Col md={6}>
              <Form.Select value={semester} onChange={(e) => setSemester(e.target.value)} size="sm">
                <option value="">-- Select Semester --</option>
                {SEMESTER_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={!semester}
                size="sm"
              >
                <option value="">-- Select Course --</option>
                {COURSE_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col md={6}>
              <Form.Control
                type="text"
                size="sm"
                value={student.id}
                onChange={(e) => setStudent({ ...student, id: e.target.value })}
                placeholder="e.g., alice_12345"
              />
              <Form.Text className="text-muted">firstname_idnumber</Form.Text>
            </Col>
            <Col md={6}>
              <Form.Control
                type="email"
                size="sm"
                value={student.email}
                onChange={(e) => setStudent({ ...student, email: e.target.value })}
                placeholder="student@example.com"
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button size="sm" variant="success" onClick={handleEnrollment}>
              Submit Enrollment
            </Button>
          </div>

          {enrolledStudent && (
            <>
              <Alert variant="warning" className="mt-3 mb-2 py-2">
                ⚠️ <strong>Important:</strong> Please <u>copy and save</u> your login information.
              </Alert>

              <Table bordered size="sm" className="mb-2">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Password</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{enrolledStudent.id}</td>
                    <td>{enrolledStudent.email}</td>
                    <td><code>{enrolledStudent.password}</code></td>
                  </tr>
                </tbody>
              </Table>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => {
                    const text = `Student ID: ${enrolledStudent.id}\nEmail: ${enrolledStudent.email}\nPassword: ${enrolledStudent.password}`;
                    navigator.clipboard.writeText(text)
                      .then(() => alert("✅ Login info copied to clipboard."))
                      .catch(() => alert("❌ Failed to copy login info."));
                  }}
                >
                  📋 Copy Info
                </Button>

                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    const text = `Student ID: ${enrolledStudent.id}\nEmail: ${enrolledStudent.email}\nPassword: ${enrolledStudent.password}`;
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `${enrolledStudent.id}_login.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  📄 Download Info
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}

export default StudentEnrollment;
