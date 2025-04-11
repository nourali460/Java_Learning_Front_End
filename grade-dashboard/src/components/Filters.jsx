import React, { useEffect, useMemo } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';

function Filters({
  grades,
  semester, setSemester,
  course, setCourse,
  assignment, setAssignment,
  studentQuery, setStudentQuery
}) {
  // Unique dropdown options based on grades
  const semesters = useMemo(() => [...new Set(grades.map(g => g.semesterId).filter(Boolean))].sort(), [grades]);
  const courses = useMemo(() => [...new Set(grades.map(g => g.course).filter(Boolean))].sort(), [grades]);
  const assignments = useMemo(() => {
    return [...new Set(
      grades
        .filter(g => !course || g.course === course)
        .map(g => g.assignment)
        .filter(Boolean)
    )].sort();
  }, [grades, course]);

  // Restore selected semester from localStorage (optional)
  useEffect(() => {
    const saved = localStorage.getItem("selectedSemester");
    if (saved && semesters.includes(saved)) {
      setSemester(saved);
    }
  }, [semesters, setSemester]);

  useEffect(() => {
    localStorage.setItem("selectedSemester", semester);
  }, [semester]);

  return (
    <Card className="p-3 mb-4 shadow-sm">
      <Row className="g-3">
        <Col md={3}>
          <Form.Label>Semester</Form.Label>
          <Form.Select value={semester} onChange={(e) => setSemester(e.target.value)}>
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s} value={s}>{s}</option>)}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label>Course</Form.Label>
          <Form.Select value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label>Assignment</Form.Label>
          <Form.Select value={assignment} onChange={(e) => setAssignment(e.target.value)}>
            <option value="">All Assignments</option>
            {assignments.map(a => <option key={a} value={a}>{a}</option>)}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label>Search by Student ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. student123"
            value={studentQuery}
            onChange={(e) => setStudentQuery(e.target.value)}
          />
        </Col>
      </Row>
    </Card>
  );
}

export default Filters;
