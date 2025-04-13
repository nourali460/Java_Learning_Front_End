import React, { useState } from 'react';
import { Table } from 'react-bootstrap';

function GradeTable({ data, formatCourseLabel }) {
  const [sortConfig, setSortConfig] = useState({ column: 'timestamp', direction: 'desc' });

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
          </tr>
        </thead>
        <tbody>
          {sortedData.map((g, idx) => (
            <tr key={idx}>
              <td>{g.studentId}</td>
              <td>{formatCourseLabel ? formatCourseLabel(g.course) : g.course}</td>
              <td>{formatAssignmentLabel(g.assignment)}</td>
              <td>{g.grade}</td>
              <td>{new Date(g.timestamp).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short'
              })}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default GradeTable;
