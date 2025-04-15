const baseUrl = "https://api-todo-list-pbw.vercel.app";

const registerForm = document.getElementById("register-form");
const messageDiv = document.getElementById("message");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("register-fullName").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });
    const result = await response.json();

    if (response.ok) {
      messageDiv.style.color = "green";
      messageDiv.textContent = "Registrasi berhasil. Silakan login.";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      messageDiv.textContent = result.message || "Registrasi gagal.";
    }
  } catch (error) {
    console.error(error);
    messageDiv.textContent = "Terjadi kesalahan. Silakan coba lagi.";
  }
});
