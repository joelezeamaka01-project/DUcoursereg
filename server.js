const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { supabase } = require("./supabase-client");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to wrap handlers with Supabase connection check
async function withDatabase(handler) {
  return async function (req, res) {
    try {
      // Test Supabase connection
      const { data, error } = await supabase.from("students").select("count()").limit(1);
      if (error) throw error;
      return await handler(req, res);
    } catch (error) {
      console.error("Database request failed:", error.message);
      return res.status(500).json({
        success: false,
        message: "The database connection is unavailable. Please check your Supabase configuration.",
      });
    }
  };
}

// Test Supabase connection on startup
(async () => {
  try {
    const { error } = await supabase.from("students").select("count()").limit(1);
    if (error) throw error;
    console.log("Connected to Supabase PostgreSQL database");
  } catch (error) {
    console.warn("Database connection warning:", error.message);
  }
})();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use(express.json());
app.use(express.static(__dirname));

async function sendResetEmail(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Dominion University Password Reset Code",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d1d1d;">
        <h2 style="color: #1b1b4f;">Password Reset Request</h2>
        <p>Your 6-digit reset code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1b1b4f;">${code}</p>
        <p>This code expires in 10 minutes.</p>
        <p>Use it to reset your password on the Dominion University portal.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

app.post("/api/request-reset", withDatabase(async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  try {
    const { data: student, error: selectError } = await supabase
      .from("students")
      .select("*")
      .eq("email", email)
      .single();

    if (selectError || !student) {
      return res.status(404).json({
        success: false,
        message: "No account is registered with that email.",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("students")
      .update({
        reset_code: code,
        reset_code_expires_at: expiresAt,
      })
      .eq("email", email);

    if (updateError) throw updateError;

    try {
      await sendResetEmail(email, code);
    } catch (mailError) {
      console.error("Mail send failed:", mailError);
      return res.status(500).json({
        success: false,
        message: "Email could not be sent. Check your SMTP settings.",
      });
    }

    return res.json({
      success: true,
      message: "A 6-digit reset code has been sent to your email.",
    });
  } catch (error) {
    console.error("Request reset failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to process password reset request.",
    });
  }
}));

app.post("/api/reset-password", withDatabase(async (req, res) => {
  const { email, code, newPassword } = req.body || {};

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, code, and new password are required.",
    });
  }

  try {
    const { data: student, error: selectError } = await supabase
      .from("students")
      .select("reset_code, reset_code_expires_at")
      .eq("email", email)
      .single();

    if (selectError || !student) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email.",
      });
    }

    if (!student.reset_code || String(student.reset_code) !== String(code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code.",
      });
    }

    const expiresAt = new Date(student.reset_code_expires_at || 0).getTime();
    if (Date.now() > expiresAt) {
      return res.status(400).json({
        success: false,
        message: "This reset code has expired. Please request a new one.",
      });
    }

    const { error: updateError } = await supabase
      .from("students")
      .update({
        password: newPassword,
        reset_code: null,
        reset_code_expires_at: null,
      })
      .eq("email", email);

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Password reset failed.",
    });
  }
}));

app.post("/api/login", withDatabase(async (req, res) => {
  const { matricNumber, password } = req.body || {};

  if (!matricNumber || !password) {
    return res.status(400).json({
      success: false,
      message: "Matric number and password are required.",
    });
  }

  try {
    const { data: student, error: selectError } = await supabase
      .from("students")
      .select("*")
      .eq("matric_number", matricNumber)
      .single();

    if (selectError || !student) {
      return res.status(404).json({
        success: false,
        message: "No account found for this matric number.",
      });
    }

    if (String(student.password) !== String(password)) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    return res.json({
      success: true,
      student: {
        id: student.id,
        full_name: student.full_name,
        matric_number: student.matric_number,
        email: student.email,
        program: student.program,
        level: student.level,
        semester: student.semester,
        academic_year: student.academic_year,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed.",
    });
  }
}));

app.post("/api/register", withDatabase(async (req, res) => {
  const {
    full_name,
    matric_number,
    email,
    password,
    program,
    level,
    semester,
    academic_year,
  } = req.body || {};

  if (!full_name || !matric_number || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Full name, matric number, email, and password are required.",
    });
  }

  try {
    const { data: student, error: insertError } = await supabase
      .from("students")
      .upsert(
        {
          full_name,
          matric_number,
          email,
          password,
          program: program || null,
          level: level || null,
          semester: semester || null,
          academic_year: academic_year || null,
        },
        { onConflict: "matric_number" }
      )
      .select()
      .single();

    if (insertError) throw insertError;

    return res.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
}));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("*", (req, res) => {
  const safePath = ["login.html", "index.html", "dashboard.html", "forgot-password.html", "faq.html"].includes(req.path.replace("/", ""))
    ? req.path.replace("/", "")
    : "login.html";

  res.sendFile(path.join(__dirname, safePath));
});

transporter.verify()
  .then(() => console.log("SMTP connection ready"))
  .catch((error) => {
    console.warn("SMTP not ready yet:", error.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
