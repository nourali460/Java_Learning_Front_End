const API_BASE_URL = "https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com";

function getAdminNameFromToken(token) {
  const payload = token.split('.')[1];
  const decoded = atob(payload);
  const parsed = JSON.parse(decoded);
  console.log("🔍 Decoded admin name (sub):", parsed.sub);
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

function applyFilters() {
  const studentFilter = document.getElementById("studentFilter").value.trim().toLowerCase();
  const assignmentFilter = document.getElementById("assignmentFilter").value.trim().toLowerCase();

  const rows = document.querySelectorAll("#grades-table-body tr");

  rows.forEach(row => {
    const studentId = row.children[0].textContent.toLowerCase();
    const assignment = row.children[2].textContent.toLowerCase();

    const matchesStudent = !studentFilter || studentId.includes(studentFilter);
    const matchesAssignment = !assignmentFilter || assignment.includes(assignmentFilter);

    row.style.display = (matchesStudent && matchesAssignment) ? "" : "none";
  });
}


function showGrades() {
  const token = localStorage.getItem("jwt");
  if (!token) return;

  const adminName = getAdminNameFromToken(token);
  const url = `${API_BASE_URL}/grades?admin=${adminName}`;

  document.getElementById("login-section").style.display = "none";
  document.getElementById("grades-section").style.display = "block";

  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(grades => {
      const tbody = document.getElementById("grades-table-body");
      tbody.innerHTML = "";

      // Sort by timestamp (descending)
      grades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      grades.forEach(g => {
        const dateFormatted = new Date(g.timestamp).toLocaleString(undefined, {
          dateStyle: 'short',
          timeStyle: 'short'
        });

        const row = `<tr>
          <td>${g.studentId}</td>
          <td>${g.course}</td>
          <td>${g.assignment}</td>
          <td>${g.grade}</td>
          <td>${dateFormatted}</td>
        </tr>`;
        tbody.innerHTML += row;
      });
    })
    .catch(err => {
      console.error(err);
      alert("Failed to fetch grades.");
    });
}

function logout() {
  localStorage.removeItem("jwt");
  location.reload();
}

window.onload = () => {
  if (localStorage.getItem("jwt")) {
    showGrades();
  }
};
