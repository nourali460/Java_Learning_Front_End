const API_BASE_URL = "https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com";
let gradeData = [];
let currentDisplayedData = [];

function getAdminNameFromToken(token) {
  const payload = token.split('.')[1];
  const decoded = atob(payload);
  const parsed = JSON.parse(decoded);
  return parsed.sub;
}

function showGrades() {
  const token = localStorage.getItem("jwt");
  if (!token) return;

  const adminName = getAdminNameFromToken(token);
  const url = `${API_BASE_URL}/grades?admin=${adminName}`;

  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      gradeData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      populateSemesterDropdown(gradeData);
      populateCourseDropdown(gradeData);
      populateAssignmentDropdown(gradeData);
      applyFilters();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to fetch grades.");
    });
}

function populateSemesterDropdown(data) {
  const semesterSet = new Set(data.map(g => g.semesterId).filter(Boolean));
  const semesterSelect = $("#semester-select");
  semesterSelect.empty().append('<option value="">All Semesters</option>');

  Array.from(semesterSet).sort().forEach(semester => {
    semesterSelect.append(`<option value="${semester}">${semester}</option>`);
  });

  const saved = localStorage.getItem("selectedSemester");
  if (saved && semesterSet.has(saved)) {
    semesterSelect.val(saved);
  }
}

function populateCourseDropdown(data) {
  const courseSet = new Set(data.map(g => g.course).filter(Boolean));
  const courseSelect = $("#course-select");
  courseSelect.empty().append('<option value="">All Courses</option>');

  Array.from(courseSet).sort().forEach(course => {
    courseSelect.append(`<option value="${course}">${course}</option>`);
  });

  const saved = localStorage.getItem("selectedCourse");
  if (saved && courseSet.has(saved)) {
    courseSelect.val(saved);
  }
}

function populateAssignmentDropdown(data) {
  const selectedCourse = $("#course-select").val();
  const assignmentSet = new Set(
    data.filter(g => !selectedCourse || g.course === selectedCourse)
        .map(g => g.assignment)
        .filter(Boolean)
  );

  const assignmentSelect = $("#assignment-select");
  assignmentSelect.empty().append('<option value="">All Assignments</option>');

  Array.from(assignmentSet).sort().forEach(a => {
    assignmentSelect.append(`<option value="${a}">${a}</option>`);
  });

  const saved = localStorage.getItem("selectedAssignment");
  if (saved && assignmentSet.has(saved)) {
    assignmentSelect.val(saved);
  }
}

function applyFilters() {
  const query = $("#search-student").val().toLowerCase();
  const selectedSemester = $("#semester-select").val();
  const selectedCourse = $("#course-select").val();
  const selectedAssignment = $("#assignment-select").val();

  localStorage.setItem("selectedSemester", selectedSemester);
  localStorage.setItem("selectedCourse", selectedCourse);
  localStorage.setItem("selectedAssignment", selectedAssignment);

  const filtered = gradeData.filter(g => {
    const matchId = g.studentId.toLowerCase().includes(query);
    const matchSemester = !selectedSemester || g.semesterId === selectedSemester;
    const matchCourse = !selectedCourse || g.course === selectedCourse;
    const matchAssignment = !selectedAssignment || g.assignment === selectedAssignment;
    return matchId && matchSemester && matchCourse && matchAssignment;
  });

  renderTable(filtered);
}

function renderTable(data) {
  currentDisplayedData = data;
  const tbody = $("#grades-table-body");
  tbody.empty();

  data.forEach(g => {
    const dateFormatted = new Date(g.timestamp).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    tbody.append(`
      <tr>
        <td>${g.studentId}</td>
        <td>${g.course}</td>
        <td>${g.assignment}</td>
        <td>${g.grade}</td>
        <td>${dateFormatted}</td>
      </tr>
    `);
  });
}

$(document).ready(() => {
  showGrades();

  $(document).on("input", "#search-student", applyFilters);
  $(document).on("change", "#semester-select", applyFilters);
  $(document).on("change", "#course-select", () => {
    populateAssignmentDropdown(gradeData);
    applyFilters();
  });
  $(document).on("change", "#assignment-select", applyFilters);
});

$(document).on('click', 'th', function () {
  const column = $(this).data('colname');
  const order = $(this).data('order');
  $(this).data('order', order === 'desc' ? 'asc' : 'desc');

  const sorted = [...currentDisplayedData].sort((a, b) => {
    if (column === "timestamp") {
      return order === 'desc'
        ? new Date(b[column]) - new Date(a[column])
        : new Date(a[column]) - new Date(b[column]);
    }
    return order === 'desc'
      ? (a[column] > b[column] ? 1 : -1)
      : (a[column] < b[column] ? 1 : -1);
  });

  renderTable(sorted);
});
