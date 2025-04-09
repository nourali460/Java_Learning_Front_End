const API_BASE_URL = "https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com";

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
    body: JSON.stringify({ name, password }),
  })
    .then((res) => res.ok ? res.json() : Promise.reject("Login failed"))
    .then((data) => {
      localStorage.setItem("jwt", data.token);
      showGrades();
    })
    .catch((err) => {
      console.error("❌ Login error:", err);
      alert("Login failed. Check credentials.");
    });
}

function showGrades() {
  const token = localStorage.getItem("jwt");
  if (!token) return;

  document.getElementById("login-section").style.display = "none";
  document.getElementById("grades-section").style.display = "block";

  fetch(`${API_BASE_URL}/grades`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((grades) => {
      const tbody = document.getElementById("grades-table-body");
      tbody.innerHTML = "";
      grades.forEach((g) => {
        const row = `
          <tr>
            <td>${g.studentId}</td>
            <td>${g.course}</td>
            <td>${g.assignment}</td>
            <td>${g.grade}</td>
            <td>${new Date(g.timestamp).toLocaleString()}</td>
          </tr>`;
        tbody.innerHTML += row;
      });
    })
    .catch((err) => {
      console.error("❌ Fetch grades error:", err);
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
