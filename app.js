const API_BASE_URL = "https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com";

// Handle Login
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
      document.getElementById("login-section").style.display = "none";
      document.getElementById("main-content").style.display = "block";
      loadTab("grades");
    })
    .catch(err => {
      console.error(err);
      alert("Login failed. Check credentials.");
    });
}

// Handle Logout
function logout() {
  localStorage.removeItem("jwt");
  location.reload();
}

// Load the appropriate tab content
function loadTab(tabName) {
  // Reset content area
  const gradesTab = document.getElementById("grades-tab");
  const manageTab = document.getElementById("manage-tab");

  if (tabName === "grades") {
    gradesTab.style.display = "block";
    manageTab.style.display = "none";
    // You can add logic here to dynamically load content for grades
    gradesTab.innerHTML = "<h3>Student Grades</h3><p>Grades content will be loaded here...</p>";
  } else if (tabName === "manage") {
    gradesTab.style.display = "none";
    manageTab.style.display = "block";
    // You can add logic here to dynamically load content for manage students
    manageTab.innerHTML = "<h3>Manage Students</h3><p>Manage students content will be loaded here...</p>";
  }
}

// Tab event listeners
window.onload = () => {
  const token = localStorage.getItem("jwt");

  if (token) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    loadTab("grades");
  }

  document.getElementById("tab-grades").addEventListener("click", () => loadTab("grades"));
  document.getElementById("tab-manage").addEventListener("click", () => loadTab("manage"));
};
