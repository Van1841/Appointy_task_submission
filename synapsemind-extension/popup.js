// Popup script for SynapseMind extension

const API_URL = 'http://localhost:5000/api';

// DOM elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginText = document.getElementById('login-text');
const loginLoader = document.getElementById('login-loader');
const errorMsg = document.getElementById('error-msg');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const totalSavesSpan = document.getElementById('total-saves');

// Check if user is already logged in
async function checkAuth() {
  const { token, user } = await chrome.storage.local.get(['token', 'user']);

  if (token && user) {
    showDashboard(user);
    loadStats(token);
  } else {
    showLogin();
  }
}

// Show login screen
function showLogin() {
  loginScreen.style.display = 'block';
  dashboardScreen.style.display = 'none';
}

// Show dashboard screen
function showDashboard(user) {
  loginScreen.style.display = 'none';
  dashboardScreen.style.display = 'block';
  userNameSpan.textContent = user.name || user.email;
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Show loading state
  loginBtn.disabled = true;
  loginText.style.display = 'none';
  loginLoader.style.display = 'inline-block';
  errorMsg.textContent = '';

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Save token and user data
      await chrome.storage.local.set({
        token: data.token,
        user: data.user
      });

      // Show dashboard
      showDashboard(data.user);
      loadStats(data.token);

      // Clear form
      loginForm.reset();
    } else {
      errorMsg.textContent = data.error || 'Login failed. Please try again.';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMsg.textContent = 'Failed to connect to SynapseMind. Make sure the backend is running.';
  } finally {
    // Reset button state
    loginBtn.disabled = false;
    loginText.style.display = 'inline';
    loginLoader.style.display = 'none';
  }
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove(['token', 'user']);
  showLogin();
});

// Load user stats
async function loadStats(token) {
  try {
    const response = await fetch(`${API_URL}/uploads`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      totalSavesSpan.textContent = data.uploads?.length || 0;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Initialize popup
checkAuth();
