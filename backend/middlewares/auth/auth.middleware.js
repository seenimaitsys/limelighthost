import jwt from "jsonwebtoken";
import { checkRole } from "../../models/auth/auth.model.js";
export const authenticateToken = (req, res, next) => {
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        return res.status(403).json({ message: "Forbidden" });
      } else {
        jwt.verify(authorization[1], process.env.JWT_SECRET, (err, user) => {
          if (err) return res.status(403).json({ message: "Forbidden" });

          req.userId = user.userId;
          next();
        });
      }
    } catch (error) {
      next(error);
    }
  } else {
    return res.status(403).json({ message: "Forbidden" });
  }
};

export const authorizeRole = async (req, res, next) => {
  const { role_id } = req.method === "GET" ? req.query : req.body;
 
  try {
    const result = await checkRole(role_id, req.userId);
    req.userdata = result;
    next();
  } catch (error) {
    next(error);
  }
};
export const authorizeRoleCheck = async (req, res, next) => {
  const { role_id } = req.body;

  const result = await checkRole(role_id, req.userId);
  if (!result) {
    return res.status(403).json({ message: "Forbidden" });
  } else {
    return res.status(200).json({ message: "ok" });
  }
};
