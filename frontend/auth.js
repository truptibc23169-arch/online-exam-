function getApiBaseUrl() {
  return (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) ? window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "") : "";
}

async function apiRequest(path, payload) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl || baseUrl.includes("YOUR-BACKEND-ON-RENDER")) {
    throw new Error("Set frontend/config.js to your Render backend URL first.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

async function register() {
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const pass = document.getElementById("password")?.value;
  const confirm = document.getElementById("confirm-password")?.value;

  if (!name || !email || !pass || !confirm) {
    alert("Please fill all fields");
    return;
  }

  if (pass !== confirm) {
    alert("Passwords do not match");
    return;
  }

  try {
    const data = await apiRequest("/api/register", { name, email, password: pass });
    setCurrentUser({ name: data.user?.name || name, email: data.user?.email || email });
    alert("Registered Successfully 🎉");
    window.location.href = "./login.html";
  } catch (error) {
    alert(error.message);
  }
}

async function login() {
  const email = document.getElementById("email")?.value.trim();
  const pass = document.getElementById("password")?.value;

  if (!email || !pass) {
    alert("Please fill all fields");
    return;
  }

  try {
    const data = await apiRequest("/api/login", { email, password: pass });
    setCurrentUser({ name: data.user?.name || email, email: data.user?.email || email });
    alert("Login Successful 🎉");
    window.location.href = "./dashboard.html";
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  clearCurrentUser();
  localStorage.removeItem("quizHistory");
  window.location.href = "./login.html";
}

window.register = register;
window.login = login;
window.logout = logout;
