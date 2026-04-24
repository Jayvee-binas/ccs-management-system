const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
  user: process.env.DB_USER || process.env.MYSQLUSER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "",
  database:
    process.env.DB_NAME || process.env.MYSQLDATABASE || "ccs_management",
  port:
    parseInt(process.env.DB_PORT) || parseInt(process.env.MYSQLPORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: "utf8mb4",
});

// Test connection
pool
  .getConnection()
  .then((conn) => {
    console.log("Connected to MySQL database successfully");
    conn.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    console.error("Error details:", {
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState,
    });
  });

module.exports = pool;
