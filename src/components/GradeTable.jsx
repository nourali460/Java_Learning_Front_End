import React, { useState } from 'react';
import { Table, Button, Collapse } from 'react-bootstrap';

function GradeTable({ data, formatCourseLabel }) {
  const [sortConfig, setSortConfig] = useState({ column: 'timestamp', direction: 'desc' });
  const [openIndex, setOpenIndex] = useState(null);

  const handleSort = (column) => {
    setSortConfig((prev) => {
      const direction = prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc';
      return { column, direction };
    });
  };

  const sortedData = [...data].sort((a, b) => {
    const { column, direction } = sortConfig;

    if (column === 'timestamp') {
      return direction === 'asc'
        ? new Date(a.timestamp) - new Date(b.timestamp)
        : new Date(b.timestamp) - new Date(a.timestamp);
    }

    const aVal = a[column]?.toString().toLowerCase() || '';
    const bVal = b[column]?.toString().toLowerCase() || '';

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderArrow = (col) => {
    if (sortConfig.column !== col) return '⬍';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const formatAssignmentLabel = (name) => name.replace(/_/g, ' ');

  const toggleCollapse = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-primary">
          <tr>
            <th onClick={() => handleSort('studentId')}>Student ID {renderArrow('studentId')}</th>
            <th onClick={() => handleSort('course')}>Course {renderArrow('course')}</th>
            <th onClick={() => handleSort('assignment')}>Assignment {renderArrow('assignment')}</th>
            <th onClick={() => handleSort('grade')}>Grade {renderArrow('grade')}</th>
            <th onClick={() => handleSort('timestamp')}>Timestamp {renderArrow('timestamp')}</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((g, idx) => (
            <React.Fragment key={idx}>
              <tr>
                <td>{g.studentId}</td>
                <td>{formatCourseLabel ? formatCourseLabel(g.course) : g.course}</td>
                <td>{formatAssignmentLabel(g.assignment)}</td>
                <td>{g.grade}</td>
                <td>{new Date(g.timestamp).toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => toggleCollapse(idx)}
                  >
                    {openIndex === idx ? 'Hide' : 'View'}
                  </Button>
                </td>
              </tr>
              <tr>
                <td colSpan={6} style={{ padding: 0, borderTop: 'none' }}>
                  <Collapse in={openIndex === idx}>
                    <div style={{
                      background: '#f8f9fa',
                      padding: '10px',
                      whiteSpace: 'pre-wrap',
                      borderTop: '1px solid #dee2e6',
                      fontFamily: 'monospace'
                    }}>
                      {g.consoleOutput || 'No feedback available.'}
                    </div>
                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default GradeTable;
