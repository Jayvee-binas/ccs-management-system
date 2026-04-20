const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getSupabaseClient = require("../config/database");
const {
  authenticateToken,
  authorizeRoles,
  checkUserStatus,
} = require("../middleware/auth");

// Maximum login attempts before lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Student Login
router.post("/student/login", async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({
        success: false,
        message: "Student ID and password are required",
      });
    }

    // Find student by student_id with user info
    const supabase = getSupabaseClient();
    const { data: students, error } = await supabase
      .from("students")
      .select(
        `
        *,
        users!inner (
          password_hash,
          status,
          failed_attempts,
          locked_until,
          id as user_id,
          username,
          email
        )
      `,
      )
      .eq("student_id", studentId)
      .single();

    if (error || !students) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Student ID or password" });
    }

    const student = students;

    // Check if account is locked
    if (
      student.users.locked_until &&
      new Date(student.users.locked_until) > new Date()
    ) {
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    // Check if account is active
    if (!student.users.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, student.users.password_hash);

    if (!isMatch) {
      // Increment failed attempts
      const failedAttempts = (student.users.failed_attempts || 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        const supabase = getSupabaseClient();
        await supabase
          .from("users")
          .update({
            failed_attempts: failedAttempts,
            locked_until: lockedUntil.toISOString(),
          })
          .eq("id", student.users.user_id);

        return res.status(403).json({
          success: false,
          message:
            "Account locked due to too many failed attempts. Please try again in 15 minutes.",
        });
      }

      await supabase
        .from("users")
        .update({ failed_attempts: failedAttempts })
        .eq("id", student.users.user_id);

      return res.status(401).json({
        success: false,
        message: `Invalid Student ID or password. ${MAX_LOGIN_ATTEMPTS - failedAttempts} attempts remaining.`,
      });
    }

    // Reset failed attempts and update last login
    await supabase
      .from("users")
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", student.users.user_id);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: student.users.user_id,
        studentId: student.student_id,
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: student.id,
        userId: student.users.user_id,
        studentId: student.student_id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.users.email,
        role: "student",
      },
    });
  } catch (error) {
    console.error("Student login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Teacher Login
router.post("/teacher/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find teacher by email with user info
    const { data: teachers, error } = await supabase
      .from("teachers")
      .select(
        `
        *,
        users!inner (
          password_hash,
          status,
          failed_attempts,
          locked_until,
          id as user_id,
          username,
          email as user_email
        )
      `,
      )
      .or(`email.eq.${email},users.email.eq.${email}`)
      .single();

    if (error || !teachers) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const teacher = teachers;

    // Check if account is locked
    if (
      teacher.users.locked_until &&
      new Date(teacher.users.locked_until) > new Date()
    ) {
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    // Check if account is active
    if (!teacher.users.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, teacher.users.password_hash);

    if (!isMatch) {
      const failedAttempts = (teacher.users.failed_attempts || 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        await supabase
          .from("users")
          .update({
            failed_attempts: failedAttempts,
            locked_until: lockedUntil.toISOString(),
          })
          .eq("id", teacher.users.user_id);

        return res.status(403).json({
          success: false,
          message:
            "Account locked due to too many failed attempts. Please try again in 15 minutes.",
        });
      }

      await supabase
        .from("users")
        .update({ failed_attempts: failedAttempts })
        .eq("id", teacher.users.user_id);

      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - failedAttempts} attempts remaining.`,
      });
    }

    // Reset failed attempts and update last login
    await supabase
      .from("users")
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", teacher.users.user_id);

    // Generate JWT token
    const token = jwt.sign(
      { id: teacher.users.user_id, email: teacher.email, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: teacher.id,
        userId: teacher.users.user_id,
        email: teacher.email,
        firstName: teacher.first_name,
        lastName: teacher.last_name,
        role: "teacher",
        position: teacher.position,
      },
    });
  } catch (error) {
    console.error("Teacher login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Admin Login
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find admin by username or email
    const { data: admins, error } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${username},email.eq.${username}`)
      .eq("role", "admin")
      .single();

    if (error || !admins) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const admin = admins;

    // Check if account is locked
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    // Check if account is active
    if (!admin.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      const failedAttempts = (admin.failed_attempts || 0) + 1;

      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
        await supabase
          .from("users")
          .update({
            failed_attempts: failedAttempts,
            locked_until: lockedUntil.toISOString(),
          })
          .eq("id", admin.id);

        return res.status(403).json({
          success: false,
          message:
            "Account locked due to too many failed attempts. Please try again in 15 minutes.",
        });
      }

      await supabase
        .from("users")
        .update({ failed_attempts: failedAttempts })
        .eq("id", admin.id);

      return res.status(401).json({
        success: false,
        message: `Invalid username or password. ${MAX_LOGIN_ATTEMPTS - failedAttempts} attempts remaining.`,
      });
    }

    // Reset failed attempts and update last login
    await supabase
      .from("users")
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", admin.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get current user info
router.get("/me", authenticateToken, checkUserStatus, async (req, res) => {
  try {
    let user = null;
    let profileId = null;

    if (req.user.role === "student") {
      const { data: students, error } = await supabase
        .from("students")
        .select(
          `
          *,
          users!inner (
            email as user_email,
            is_active as status,
            last_login
          )
        `,
        )
        .eq("user_id", req.user.id)
        .single();

      if (!error && students) {
        user = {
          ...students,
          email: students.users.user_email,
          status: students.users.status,
        };
        profileId = students.id;
      }
    } else if (req.user.role === "teacher") {
      const { data: teachers, error } = await supabase
        .from("teachers")
        .select(
          `
          *,
          users!inner (
            is_active as status,
            last_login
          )
        `,
        )
        .eq("user_id", req.user.id)
        .single();

      if (!error && teachers) {
        user = { ...teachers, status: teachers.users.status };
        profileId = teachers.id;
      }
    } else if (req.user.role === "admin") {
      const { data: admins, error } = await supabase
        .from("users")
        .select(
          "id, username, email, is_active as status, last_login, created_at",
        )
        .eq("id", req.user.id)
        .eq("role", "admin")
        .single();

      if (!error && admins) {
        user = admins;
        profileId = admins.id;
      }
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        ...user,
        id: req.user.id, // user table ID (from JWT)
        profileId, // student/teacher table ID
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Change password
router.put(
  "/change-password",
  authenticateToken,
  checkUserStatus,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }

      // Get current password hash
      const { data: users, error } = await supabase
        .from("users")
        .select("password_hash")
        .eq("id", req.user.id)
        .single();

      if (error || !users) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(
        currentPassword,
        users.password_hash,
      );

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await supabase
        .from("users")
        .update({ password_hash: hashedPassword })
        .eq("id", req.user.id);

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// Logout (client-side token removal, but we can log it)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Log the logout action
    await supabase.from("audit_log").insert({
      table_name: "users",
      record_id: req.user.id,
      action: "LOGOUT",
      new_values: { role: req.user.role },
      changed_by: req.user.username || req.user.email,
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Verify token validity
router.get("/verify", authenticateToken, (req, res) => {
  res.json({ success: true, message: "Token is valid", user: req.user });
});

module.exports = router;
