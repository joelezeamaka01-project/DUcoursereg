// Backend API Configuration
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://your-backend-domain.com";

function showMessage(message, isError = false, targetForm = null) {
  const form = targetForm || document.querySelector(".login-form") || document.querySelector(".registration-form") || document.body;
  let messageBox = document.getElementById("formMessage");

  if (!messageBox) {
    messageBox = document.createElement("p");
    messageBox.id = "formMessage";
    messageBox.style.marginTop = "12px";
    messageBox.style.fontSize = "0.9rem";
    messageBox.style.fontWeight = "600";
    form.appendChild(messageBox);
  }

  messageBox.textContent = message;
  messageBox.style.color = isError ? "#c0392b" : "#1a7f5a";
  messageBox.style.display = "block";
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      message: text.slice(0, 180) || "The server returned an unexpected response.",
    };
  }
}

function showResetMessage(message, isError = false) {
  const messageBox = document.getElementById("resetMessage");
  if (!messageBox) return;
  messageBox.textContent = message;
  messageBox.style.color = isError ? "#c0392b" : "#1a7f5a";
}

function setupHamburgerMenu() {
  const hamburgerButton = document.querySelector(".hamburger-btn");
  const mobileMenuPanel = document.getElementById("mobileMenuPanel");
  const closeMenuButton = document.querySelector(".close-menu");

  if (!hamburgerButton || !mobileMenuPanel) return;

  const toggleMenu = () => {
    const isOpen = mobileMenuPanel.classList.toggle("open");
    hamburgerButton.classList.toggle("open", isOpen);
    hamburgerButton.setAttribute("aria-expanded", String(isOpen));
    mobileMenuPanel.setAttribute("aria-hidden", String(!isOpen));
  };

  hamburgerButton.addEventListener("click", toggleMenu);

  if (closeMenuButton) {
    closeMenuButton.addEventListener("click", toggleMenu);
  }

  mobileMenuPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenuPanel.classList.remove("open");
      hamburgerButton.classList.remove("open");
      hamburgerButton.setAttribute("aria-expanded", "false");
      mobileMenuPanel.setAttribute("aria-hidden", "true");
    });
  });
}

function setupHelpModal() {
  const helpButton = document.getElementById("helpButton");
  const helpModal = document.getElementById("helpModal");
  const helpClose = document.querySelector(".help-close");

  if (!helpButton || !helpModal) return;

  const openHelp = () => {
    helpModal.classList.remove("hidden");
    helpModal.setAttribute("aria-hidden", "false");
  };

  const closeHelp = () => {
    helpModal.classList.add("hidden");
    helpModal.setAttribute("aria-hidden", "true");
  };

  helpButton.addEventListener("click", openHelp);

  if (helpClose) {
    helpClose.addEventListener("click", closeHelp);
  }

  helpModal.addEventListener("click", (event) => {
    if (event.target === helpModal) {
      closeHelp();
    }
  });
}

function setupPasswordToggle() {
  const toggleButton = document.getElementById("passwordToggle");
  const passwordInput = document.getElementById("password");

  if (!toggleButton || !passwordInput) return;

  const eyeOpen = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="eye-icon eye-open">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
    </svg>
  `;

  const eyeClosed = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="eye-icon eye-closed">
      <path d="M3 3l18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9.1 5.5A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.9 17.9 0 0 1-4.1 5.4M6.7 6.7A17.8 17.8 0 0 0 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4.7-1.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  toggleButton.innerHTML = eyeOpen;

  toggleButton.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleButton.innerHTML = isHidden ? eyeClosed : eyeOpen;
    toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });
}

async function loginStudent(event) {
  event.preventDefault();

  const form = document.querySelector(".login-form");
  if (!form) return;

  const matricNumberInput = form.querySelector('input[name="matricNumber"]');
  const passwordInput = form.querySelector('input[name="password"]');

  if (!matricNumberInput || !passwordInput) return;

  const matricNumber = matricNumberInput.value.trim();
  const password = passwordInput.value.trim();

  if (!matricNumber || !password) {
    showMessage("Please enter your matric number and password.", true, form);
    return;
  }

  try {
    console.log("Attempting login with matric:", matricNumber);
    console.log("API URL:", `${API_BASE_URL}/login`);
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricNumber, password }),
    });

    console.log("API Response status:", response.status);
    
    const result = await readJsonResponse(response);
    
    console.log("API Response:", result);

    if (!response.ok) {
      console.error("Login failed with status:", response.status);
      showMessage(result.message || "Login failed. Please check your credentials.", true, form);
      return;
    }

    if (result.student) {
      console.log("Login successful for student:", result.student.full_name);
      localStorage.setItem("loggedInStudent", JSON.stringify(result.student));
      window.location.href = "index.html";
    } else {
      showMessage("Login successful but no student data received.", true, form);
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage(error.message || "Login failed. Please try again.", true, form);
  }
}

async function saveStudentRegistration(event) {
  event.preventDefault();

  const form = document.getElementById("studentRegistrationForm");
  if (!form) return;

  const student = {
    full_name: form.fullName?.value?.trim() || "",
    matric_number: form.matricNumber?.value?.trim() || "",
    email: form.email?.value?.trim() || "",
    password: form.password?.value?.trim() || "",
    program: form.program?.value || "",
    level: form.level?.value || "",
    semester: form.semester?.value || "",
    academic_year: form.academicYear?.value || "",
  };

  if (!student.full_name || !student.matric_number || !student.email || !student.password) {
    showMessage("Please fill in full name, matric number, email, and password.", true, form);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });

    const result = await readJsonResponse(response);

    if (!response.ok) {
      showMessage(result.message || "Could not save student data.", true, form);
      return;
    }

    showMessage("Student account saved successfully.", false, form);
    form.reset();
  } catch (error) {
    showMessage(error.message || "Could not save student data.", true, form);
  }
}

async function requestPasswordReset(event) {
  event.preventDefault();

  const form = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("resetEmail");
  const resetMessage = document.getElementById("resetMessage");

  if (!form || !emailInput || !resetMessage) return;

  const email = emailInput.value.trim();
  if (!email) {
    showResetMessage("Please enter your email address.", true);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/request-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await readJsonResponse(response);

    if (!response.ok) {
      showResetMessage(result.message || "Unable to send reset code.", true);
      return;
    }

    showResetMessage(result.message || "A 6-digit reset code has been sent to your email.");

    const resetCodeForm = document.getElementById("resetCodeForm");
    const resetCodeInput = document.getElementById("resetCode");
    if (resetCodeForm && resetCodeInput) {
      resetCodeForm.classList.remove("hidden");
      resetCodeInput.focus();
    }
  } catch (error) {
    showResetMessage(error.message || "Unable to send reset code.", true);
  }
}

async function updatePasswordWithCode(event) {
  event.preventDefault();

  const email = document.getElementById("resetEmail")?.value.trim();
  const code = document.getElementById("resetCode")?.value.trim();
  const newPassword = document.getElementById("newPassword")?.value.trim();
  const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

  if (!email || !code || !newPassword || !confirmPassword) {
    showResetMessage("Please fill in all fields.", true);
    return;
  }

  if (newPassword !== confirmPassword) {
    showResetMessage("Passwords do not match.", true);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const result = await readJsonResponse(response);

    if (!response.ok) {
      showResetMessage(result.message || "Password update failed.", true);
      return;
    }

    showResetMessage(result.message || "Password reset successful. You can now log in.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  } catch (error) {
    showResetMessage(error.message || "Password update failed.", true);
  }
}

function protectDashboardPage() {
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "index.html" || currentPage === "") {
    const student = localStorage.getItem("loggedInStudent");
    if (!student) {
      window.location.href = "login.html";
    } else {
      // Load student data on dashboard
      loadStudentData();
    }
  }
}

function loadStudentData() {
  const studentData = localStorage.getItem("loggedInStudent");
  if (studentData) {
    try {
      const student = JSON.parse(studentData);
      
      // Update profile box
      const avatar = document.querySelector(".profile-box .avatar");
      const profileName = document.querySelector(".profile-box strong");
      const profileProgram = document.querySelector(".profile-box span");
      
      if (avatar && student.full_name) {
        const initials = student.full_name.split(" ").map(n => n[0]).join("").toUpperCase();
        avatar.textContent = initials;
      }
      if (profileName && student.full_name) {
        profileName.textContent = student.full_name;
      }
      if (profileProgram && student.program) {
        profileProgram.textContent = student.program;
      }
    } catch (e) {
      console.error("Error parsing student data:", e);
    }
  }
}

function logoutStudent() {
  localStorage.removeItem("loggedInStudent");
  window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", () => {
  protectDashboardPage();
  setupHamburgerMenu();
  setupHelpModal();
  setupPasswordToggle();

  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", loginStudent);
  }

  const registrationForm = document.getElementById("studentRegistrationForm");
  if (registrationForm) {
    registrationForm.addEventListener("submit", saveStudentRegistration);
  }

  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", requestPasswordReset);
  }

  const resetCodeForm = document.getElementById("resetCodeForm");
  if (resetCodeForm) {
    resetCodeForm.addEventListener("submit", updatePasswordWithCode);
  }
});
