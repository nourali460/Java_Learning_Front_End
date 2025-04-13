import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Spinner } from 'react-bootstrap';
import Filters from './Filters';
import GradeTable from './GradeTable';
import axios from 'axios';

const API_BASE_URL = 'https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com';

function Dashboard({ token, adminName, onLogout }) {
  const [grades, setGrades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [assignment, setAssignment] = useState('');
  const [studentQuery, setStudentQuery] = useState('');

  useEffect(() => {
    if (!adminName) {
      console.warn("⛔ No admin name found. Skipping grade fetch.");
      setLoading(false);
      return;
    }
  
    const fetchGrades = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/grades?admin=${adminName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sorted = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setGrades(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error('Failed to fetch grades:', err);
        alert('Failed to fetch grades.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchGrades();
  }, [adminName, token]);
  

  useEffect(() => {
    const filteredData = grades.filter((g) => {
      const matchStudent = g.studentId.toLowerCase().includes(studentQuery.toLowerCase());
      const matchSemester = !semester || g.semesterId === semester;
      const matchCourse = !course || g.course === course;
      const matchAssignment = !assignment || g.assignment === assignment;
      return matchStudent && matchSemester && matchCourse && matchAssignment;
    });
    setFiltered(filteredData);
  }, [grades, semester, course, assignment, studentQuery]);

  const handleDownloadCSV = (data) => {
    if (!data.length) return;

    const headers = ['Student ID', 'Course', 'Assignment', 'Grade', 'Timestamp'];
    const rows = data.map(g => [
      g.studentId,
      g.course,
      g.assignment,
      g.grade,
      new Date(g.timestamp).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grades-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Loading grades...</p>
      </div>
    );
  }

  return (
    <>
      {/* Logo */}
      <div className="text-center my-2">
        <img src="/logo.png" alt="Platform Logo" style={{ height: '250px', width: 'auto' }} />
      </div>

      {/* Header & Logout */}
      <Row className="align-items-center mt-4 mb-3">
        <Col><h3>Student Grades</h3></Col>
        <Col className="text-end">{/* Removed duplicate logout */}</Col>
      </Row>

      {/* Filters */}
      <Filters
        grades={grades}
        semester={semester} setSemester={setSemester}
        course={course} setCourse={setCourse}
        assignment={assignment} setAssignment={setAssignment}
        studentQuery={studentQuery} setStudentQuery={setStudentQuery}
      />

      {/* CSV Download */}
      <Button variant="success" className="mb-3" onClick={() => handleDownloadCSV(filtered)}>
        Download CSV
      </Button>

      {/* Grade Table */}
      <GradeTable data={filtered} />
    </>
  );
}

export default Dashboard;
