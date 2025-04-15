const baseUrl = "https://api-todo-list-pbw.vercel.app";

const loginForm = document.getElementById("login-form");
const messageDiv = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const resultText = await response.text();
    console.log("DEBUG: Response login (text):", resultText);

    let result;
    try {
      result = JSON.parse(resultText);
    } catch (err) {
      console.error("❌ Tidak bisa parse JSON:", err);
      messageDiv.textContent = "Server mengembalikan format tidak valid.";
      return;
    }

    const token = result.token || result.data?.token;
    const userId = result.userId || result.data?._id;

    if (!token || !userId) {
      console.warn("⚠️ Login berhasil tapi token/userId tidak ditemukan:", result);
      messageDiv.textContent = "Login berhasil, tapi data user tidak lengkap.";
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    window.location.href = "todo.html";
  } catch (error) {
    console.error("❌ Error saat login:", error);
    messageDiv.textContent = "Terjadi kesalahan. Silakan coba lagi.";
  }
});
