document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem('token', data.token); // ✅ store token
      window.location.href = '/user-dashboard.html';
    } else {
      alert(data.message || 'Login failed');
    }
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("loginEmail", email); // used for verifying later
    alert("Verification code sent to your email");
    window.location.href = "/verify.html";
  } else {
    alert(data.message);
  }
});

const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.msg || 'Login failed';
      return;
    }

    // Save token and user data
    localStorage.setItem('token', data.token);
      
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect based on role
    if (data.user.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'user-dashboard.html';
    }

  } catch (err) {
    errorMsg.textContent = 'Network error';
  }
});
