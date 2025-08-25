// document.getElementById("verifyForm").addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const code = document.getElementById("code").value;
//   const email = localStorage.getItem("loginEmail");
//     localStorage.setItem("token", data.token);


//   const res = await fetch("/api/auth/verify-code", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, code }),
//   });

//   const data = await res.json();
//   if (res.ok) {
//     localStorage.setItem("token", data.token);
//     alert("Login successful!");
//     window.location.href = "/admin.html"; // optional redirect
//   } else {
//     alert(data.message);
//   }
// });


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("verifyForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("verifyEmail").value;
    const code = document.getElementById("verifyCode").value;

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Login verified!");

      // ✅ Save token and redirect to admin or user page
      localStorage.setItem("token", data.token);

      if (data.token) {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        if (payload.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "admin.html";
        }
      } else {
        alert("Something went wrong: no token returned.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("Invalid or expired code");
    }
  });
});
