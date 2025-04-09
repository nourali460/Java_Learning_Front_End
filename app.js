const API_BASE_URL = "https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com";

// ✅ Decode JWT payload to extract admin name from "name" key
function getAdminNameFromToken(token) {
  const payload = token.split('.')[1];
  const decoded = atob(payload);
  const parsed = JSON.parse(decoded);
  return parsed.name; // ✅ use "name" instead of "sub"
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
      showGrades(); // ✅ trigger grade fetch
    })
    .catch(err => {
      console.error(err);
      alert("Login failed. Check credentials.");
    });
}

function showGrades() {
  const token = localStorage.getItem("jwt");
  if (!token) return;

  const adminName = getAdminNameFromToken(token); // ✅ extract admin name
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
      grades.forEach(g => {
        const row = `<tr>
          <td>${g.studentId}</td>
          <td>${g.course}</td>
          <td>${g.assignment}</td>
          <td>${g.grade}</td>
          <td>${g.timestamp}</td>
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
