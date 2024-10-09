import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env file
dotenv.config();

// Define the path to the certs directory
const certsPath = path.resolve("certs");

// Read SSL certificate files
const sslConfig = {
  rejectUnauthorized: false, // Ensure this is true for production
  ca: fs.readFileSync(path.join(certsPath, "server-ca.pem")).toString(),
  key: fs.readFileSync(path.join(certsPath, "client-key.pem")).toString(),
  cert: fs.readFileSync(path.join(certsPath, "client-cert.pem")).toString(),
};

const { Pool } = pg;
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
// Configure the PostgreSQL connection pool
const pool = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST, // Use the Public IP address or FQDN of your SQL instance
  port: DB_PORT,
  database: DB_NAME,
  ssl: { rejectUnauthorized: false },
});
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to the database successfully");
    // await pool.query(
    //   `INSERT INTO users(id, email, password, role_id) VALUES (2345, "senthil@twigscorp.com", 1234, 2);`
    // );
    client.release();
  } catch (err) {
    console.error("Error connecting to the database:", err.message);
  }
};

// Execute the test connection function
testConnection();
export default pool;
// senthil@twigscorp.com -> 1234 ->2
// jags@twigscorp.com -> 1234 ->2
// sraj@twigscorp.com -> 1234 ->1
// sethuraman.k@twigscorp.com -> 1234 ->1
// spandi@twigscorp.com -> 1234 ->1
// yazhni.c@twigscorp.com -> 1234 ->1
// seenivasan.t@twigscorp.com -> 1234 ->1
