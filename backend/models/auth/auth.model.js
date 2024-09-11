import pool from "../../config/database.js";
import { ErrorHandler } from "../../helpers/handleError/error.js";

export const createUser = async (email, password, isManager) => {
  const role = isManager ? 2 : 1;
  const generateUserId = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };
  try {
    return await pool.query(
      `INSERT INTO users (id,email, password, role_id) VALUES ($1, $2, $3,$4);`,
      [generateUserId(), email, password, role]
    );
  } catch (err) {
    // Check for unique constraint violation error
    if (err.code === "23505") {
      // '23505' is the PostgreSQL error code for unique violation
      throw new ErrorHandler(203, "Email already exists.");
    } else {
      throw new ErrorHandler(500, "Error creating user.");
    }
  }
};

export const getUserByEmail = async (email) => {
  try {
    const res = await pool.query(
      `SELECT users.id,users.email,users.password,roles.role_type
FROM 
    users 
JOIN
    roles ON users.role_id = roles.id
WHERE
	users.email = $1;`,
      [email]
    );
    return res.rows[0];
  } catch (err) {
    throw new ErrorHandler(500, "Error retrieving user");
  }
};

export const checkRole = async (userRole, user_id) => {
  try {
    const result = await pool.query(
      "SELECT users.id,users.email,roles.role_type FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = $1;",
      [user_id]
    );

    if (result.rowCount > 0 && result.rows[0].role_type !== userRole) {
      throw new ErrorHandler(403, "Forbidden.");
    } else {
      await pool.query(
        "UPDATE users SET lastseen = EXTRACT(EPOCH FROM NOW()) WHERE id = $1;",
        [result.rows[0].id]
      );
      return result.rows[0];
    }
  } catch (err) {
    console.log(err);
    throw new ErrorHandler(403, "Forbidden1");
  }
};
