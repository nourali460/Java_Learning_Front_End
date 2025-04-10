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
}

// Similar methods for populateCourseDropdown, populateAssignmentDropdown, and applyFilters
