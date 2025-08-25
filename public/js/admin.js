// // async function loadUsers() {
// //   const token = localStorage.getItem("token");
// //   const res = await fetch("/api/admin/users", {
// //     headers: { Authorization: "Bearer " + token },
// //   });

// //   const users = await res.json();
// //   const list = document.getElementById("userList");
// //   list.innerHTML = "";

// //   users.forEach((user) => {
// //     const li = document.createElement("li");
// //     li.innerHTML = `
// //       ${user.email} (${user.role}) - ${user.isDisabled ? "❌ Disabled" : "✅ Active"}
// //       <button onclick="toggleUser('${user._id}', ${user.isDisabled})">
// //         ${user.isDisabled ? "Enable" : "Disable"}
// //       </button>
// //       <button onclick="deleteUser('${user._id}')">Delete</button>
// //     `;
// //     list.appendChild(li);
// //   });
// // }

// // async function toggleUser(id, isDisabled) {
// //   const token = localStorage.getItem("token");
// //   const endpoint = `/api/admin/${isDisabled ? "enable" : "disable"}/${id}`;

// //   await fetch(endpoint, {
// //     method: "PUT",
// //     headers: { Authorization: "Bearer " + token },
// //   });

// //   loadUsers();
// // }

// // async function deleteUser(id) {
// //   const token = localStorage.getItem("token");
// //   await fetch(`/api/admin/delete/${id}`, {
// //     method: "DELETE",
// //     headers: { Authorization: "Bearer " + token },
// //   });

// //   loadUsers();
// // }

// // loadUsers(); // initial load

// // document.getElementById("createUserForm").addEventListener("submit", async (e) => {
// //   e.preventDefault();

// //   const email = document.getElementById("newEmail").value;
// //   const password = document.getElementById("newPassword").value;
// //   const role = document.getElementById("newRole").value;

// //   const token = localStorage.getItem("token");

// //   try {
// //     const res = await fetch("/api/admin/create", {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: "Bearer " + token,
// //       },
// //       body: JSON.stringify({ email, password, role }),
// //     });

// //     const data = await res.json();
// //     alert(data.message);

// //     if (res.ok) {
// //       // Refresh user list or notify admin
// //       loadUsers();
// //     }
// //   } catch (err) {
// //     alert("Error creating user");
// //     console.error(err);
// //   }
// // });


// document.addEventListener("DOMContentLoaded", () => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     alert("No token found. Please login again.");
//     window.location.href = "login.html";
//     return;
//   }

//   // 🧪 Optional: decode token payload to check if it's admin
//   const payload = JSON.parse(atob(token.split('.')[1]));
//   if (payload.role !== "admin") {
//     alert("You are not authorized to access this page.");
//     window.location.href = "login.html";
//     return;
//   }

//   // 🔁 Load all users
//   loadUsers(token);

//   // ✅ Create user logic
//   const createForm = document.getElementById("createUserForm");
//   createForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const email = document.getElementById("newEmail").value;
//     const password = document.getElementById("newPassword").value;
//     const role = document.getElementById("newRole").value;

//     try {
//       const res = await fetch("/api/admin/create", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer " + token,
//         },
//         body: JSON.stringify({ email, password, role }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed to create user");

//       alert(data.message);
//       createForm.reset();
//       loadUsers(token); // Refresh user list
//     } catch (err) {
//       console.error("Error creating user:", err);
//       alert(err.message);
//     }
//   });
// });

// // ✅ Load users to table/list
// async function loadUsers(token) {
//   try {
//     const res = await fetch("/api/admin/users", {
//       headers: {
//         Authorization: "Bearer " + token,
//       },
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message);

//     console.log("Loaded users:", data.users);
//     // TODO: Display users in UI (table, list, etc.)
//   } catch (err) {
//     console.error("Error loading users:", err);
//     alert("Failed to load users.");
//   }
// }

  // Temporarily skip admin check if needed
  // const payload = JSON.parse(atob(token.split('.')[1]));
  // if (payload.role !== "admin") {
  //   alert("Not authorized.");
  //   window.location.href = "login.html";
  //   return;
  // }
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("No token found. Please login again.");
    window.location.href = "login.html";
    return;
  }

  // ✅ Decode token and check admin access
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== "admin") {
    alert("You are not authorized to access this page.");
    window.location.href = "login.html";
    return;
  }

  // ✅ Load users on page load
  loadUsers();

  // ✅ Handle create user form
  const form = document.getElementById("createUserForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("newEmail").value;
      const password = document.getElementById("newPassword").value;
      const role = document.getElementById("newRole").value;

      try {
        const res = await fetch("/api/admin/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ email, password, role }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert("User created: " + data.message);
        form.reset();
        loadUsers();
      } catch (err) {
        console.error("Create User Error:", err);
        alert("Failed to create user: " + err.message);
      }
    });
  }

  // ✅ Optional: bind refresh button
  const refreshBtn = document.getElementById("refreshUsersBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => loadUsers());
  }
});

// ✅ Load and render users
async function loadUsers() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("/api/admin/users", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.users.forEach((user) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.isDisabled ? "❌ Disabled" : "✅ Active"}</td>
        <td>
          <button onclick="toggleUser('${user._id}', ${user.isDisabled})">
            ${user.isDisabled ? "Enable" : "Disable"}
          </button>
          <button onclick="deleteUser('${user._id}')">Delete</button>
        </td>
      `;

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading users:", err);
    alert("Failed to load users.");
  }
}

// ✅ Toggle user status
async function toggleUser(id, isDisabled) {
  const token = localStorage.getItem("token");
  const endpoint = `/api/admin/${isDisabled ? "enable" : "disable"}/${id}`;

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert(data.message);
    loadUsers();
  } catch (err) {
    alert("Failed to update user: " + err.message);
  }
}

// ✅ Delete user
async function deleteUser(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await fetch(`/api/admin/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert("User deleted.");
    loadUsers();
  } catch (err) {
    alert("Failed to delete user: " + err.message);
  }
}
