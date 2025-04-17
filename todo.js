const baseUrl = "https://api-todo-list-pbw.vercel.app";
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

// Jika belum login, redirect
if (!token || !userId) {
  alert("Silakan login terlebih dahulu.");
  window.location.href = "login.html";
}

// Ambil elemen DOM
const todoListEl = document.getElementById("todo-list");
const todoForm = document.getElementById("todo-form");
const todoTextInput = document.getElementById("todo-text");
const logoutBtn = document.getElementById("logout-btn");

// Ambil semua todo dari server
async function fetchTodos() {
  try {
    console.log("Fetching todos dengan token:", token);
    console.log("User ID:", userId);

    const response = await fetch(`${baseUrl}/todo/getAllTodos`, {
      method: "GET", // ✅ pakai GET
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // ❌ Hapus body: tidak boleh di GET!
    });

    const text = await response.text();
    console.log("DEBUG: Raw response text:", text);
    console.log("DEBUG: Response status:", response.status);
    console.log("DEBUG: Content-Type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Respon bukan JSON. Ini isi respon:", text);
      alert("Format respon tidak valid. Silakan login ulang.");
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    const result = JSON.parse(text);

    if (response.ok) {
      renderTodos(result.data);
    } else {
      alert(result.message || "Gagal mengambil todo.");
    }
  } catch (err) {
    console.error("❌ Error saat fetchTodos:", err);
    alert("Terjadi kesalahan saat mengambil data.");
  }
}

// Render todo ke halaman
function renderTodos(todos) {
  todoListEl.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = todo.text;

    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";
    updateBtn.onclick = () => updateTodoPrompt(todo);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteTodo(todo._id);

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(updateBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(textSpan);
    li.appendChild(actions);
    todoListEl.appendChild(li);
  });
}

// Tambah todo
todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = todoTextInput.value.trim();
  if (!text) {
    alert("Tuliskan sesuatu dulu!");
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/todo/createTodo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }), // ✅ penting!
    });

    const textResponse = await response.text();
    console.log("DEBUG /createTodo response:", textResponse);

    const result = JSON.parse(textResponse);

    if (response.ok) {
      todoTextInput.value = "";
      fetchTodos(); // panggil ulang untuk ambil list
    } else {
      alert(result.message || "Gagal menambahkan todo.");
    }
  } catch (error) {
    console.error("❌ Error createTodo:", error);
    alert("Terjadi kesalahan saat menambahkan todo.");
  }
});

// Update todo
async function updateTodoPrompt(todo) {
  const newText = prompt("Edit todo:", todo.text);
  if (!newText || newText.trim() === "") {
    alert("Update gagal: Text tidak boleh kosong");
    return;
  }

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const bodyData = {
    text: newText.trim(),
    onCheckList: true, // ⚠️ Sementara ubah jadi true dulu untuk test
    userId: userId,
  };

  console.log("DEBUG - BodyData:", bodyData);

  try {
    const response = await fetch(`${baseUrl}/todo/updateTodo/${todo._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    const result = await response.json();
    console.log("DEBUG - Server response:", result);

    if (response.ok) {
      alert("Berhasil update todo");
      fetchTodos();
    } else {
      alert("Update gagal: " + result.message);
    }
  } catch (err) {
    console.error("ERROR saat update:", err);
    alert("Gagal menghubungi server");
  }
}

// Hapus todo
async function deleteTodo(todoId) {
  if (!confirm("Yakin ingin menghapus todo ini?")) return;

  try {
    const response = await fetch(`${baseUrl}/todo/deleteTodo/${todoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (response.ok) {
      fetchTodos();
    } else {
      alert(result.message || "Gagal menghapus todo.");
    }
  } catch (error) {
    console.error("❌ Error deleteTodo:", error);
    alert("Terjadi kesalahan saat menghapus todo.");
  }
}

// Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await fetch(`${baseUrl}/auth/logout/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    console.log("Logout error (tidak masalah).");
  }

  localStorage.clear();
  window.location.href = "login.html";
});

// Panggil saat halaman dimuat
fetchTodos();
