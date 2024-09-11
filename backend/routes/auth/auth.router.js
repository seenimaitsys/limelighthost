import express from "express";
import { doRegister, doLogin } from "../../controllers/auth/auth.controller.js";
import {
  authenticateToken,
  authorizeRole,
} from "../../middlewares/auth/auth.middleware.js";

const auth = express.Router();

auth.post("/create", authenticateToken, authorizeRole, doRegister);
auth.post("/login", doLogin);

export default auth;
