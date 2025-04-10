const API_BASE_URL = "https://nour-gradeboard-api-1cea46a0d1f3.herokuapp.com";

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
      document.getElementById("login-section").style.display = "none";
      document.getElementById("main-content").style.display = "block";
      loadTab("grades");
    })
    .catch(err => {
      console.error(err);
      alert("Login failed. Check credentials.");
    });
}

function logout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("selectedSemester");
  location.reload();
}

function loadTab(tabName) {
  const contentArea = document.getElementById("tab-content");
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(`tab-${tabName}`).classList.add("active");

  // Clear previous content and load new tab content
  contentArea.innerHTML = ''; // Clear the current content

  fetch(`${tabName}.html`)
    .then(response => response.text())
    .then(html => {
      contentArea.innerHTML = html; // Set the new content
      const script = document.createElement("script");
      script.src = `js/${tabName}.js`; // Dynamically load the appropriate script for the tab
      script.type = "module";
      document.body.appendChild(script);
    })
    .catch(error => {
      console.error(`Failed to load ${tabName} tab:`, error);
    });
}

$(document).ready(() => {
  const token = localStorage.getItem("jwt");

  if (token) {
    $("#login-section").hide();
    $("#main-content").show();
    loadTab("grades");

    // Bind the events for tabs
    $("#tab-grades").on("click", () => loadTab("grades"));
    $("#tab-manage").on("click", () => loadTab("manage-students"));
  } else {
    // If not logged in, wait for login
    const interval = setInterval(() => {
      const gradesTab = $("#tab-grades");
      const manageTab = $("#tab-manage");

      if (gradesTab.length && manageTab.length) {
        gradesTab.on("click", () => loadTab("grades"));
        manageTab.on("click", () => loadTab("manage-students"));
        clearInterval(interval);
      }
    }, 50);
  }
});
