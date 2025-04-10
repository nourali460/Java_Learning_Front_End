const API_BASE_URL = "https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com";
let gradeData = [];
let currentDisplayedData = [];

function getAdminNameFromToken(token) {
  const payload = token.split('.')[1];
  const decoded = atob(payload);
  const parsed = JSON.parse(decoded);
  return parsed.sub;
}

function handleLogin() {
  const name = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!name || !password) {
    alert("Please enter both username and password.");
    return;
  }
  fetch(`${API_BASE_URL}/admins/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password })
  })
    .then(res => res.ok ? res.json() : Promise.reject("Login failed"))
    .then(data => {
      localStorage.setItem("jwt", data.token);
      showGrades();
    })
    .catch(err => {
      console.error(err);
      alert("Login failed. Check credentials.");
    });
}

function showGrades() {
  const token = localStorage.getItem("jwt");
  if (!token) return;
  const adminName = getAdminNameFromToken(token);
  const url = `${API_BASE_URL}/grades?admin=${adminName}`;
  document.getElementById("login-section").style.display = "none";
  document.getElementById("grades-section").style.display = "block";

  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      gradeData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      populateSemesterDropdown(gradeData); // dynamic again ✅
      applyFilters();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to fetch grades.");
    });
}

function populateSemesterDropdown(data) {
  const semesterSet = new Set(data.map(g => g.semesterId).filter(Boolean));
  const semesterSelect = document.getElementById("semester-select");

  semesterSelect.innerHTML = '<option value="">All Semesters</option>';
  Array.from(semesterSet).sort().forEach(semester => {
    const option = document.createElement("option");
    option.value = semester;
    option.textContent = semester;
    semesterSelect.appendChild(option);
  });

  const saved = localStorage.getItem("selectedSemester");
  if (saved && semesterSet.has(saved)) {
    semesterSelect.value = saved;
  }
}

function applyFilters() {
  const query = document.getElementById("search-student").value.toLowerCase();
  const selectedSemester = document.getElementById("semester-select").value;

  localStorage.setItem("selectedSemester", selectedSemester);

  const filtered = gradeData.filter(g => {
    const matchId = g.studentId.toLowerCase().includes(query);
    const matchSemester = !selectedSemester || g.semesterId === selectedSemester;
    return matchId && matchSemester;
  });

  renderTable(filtered);
}

function renderTable(data) {
  currentDisplayedData = data;
  const tbody = document.getElementById("grades-table-body");
  tbody.innerHTML = "";
  data.forEach(g => {
    const dateFormatted = new Date(g.timestamp).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    tbody.innerHTML += `<tr>
      <td>${g.studentId}</td>
      <td>${g.course}</td>
      <td>${g.assignment}</td>
      <td>${g.grade}</td>
      <td>${dateFormatted}</td>
    </tr>`;
  });
}

function logout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("selectedSemester");
  location.reload();
}

window.onload = () => {
  if (localStorage.getItem("jwt")) showGrades();

  const searchInput = document.getElementById("search-student");
  const semesterSelect = document.getElementById("semester-select");

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (semesterSelect) {
    semesterSelect.addEventListener("change", applyFilters);
  }
};

// ✅ Sorting only current filtered results
$('th').on('click', function () {
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
