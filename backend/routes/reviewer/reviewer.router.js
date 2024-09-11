import express from "express";

import {
  authenticateToken,
  authorizeRole,
} from "../../middlewares/auth/auth.middleware.js";
import {
  doGetVideo,
  doUpdateVideoStatus,
} from "../../controllers/reviewer/reviewer.controller.js";

const reviewer = express.Router();

reviewer.post("/getvideo", authenticateToken, authorizeRole, doGetVideo);
reviewer.patch(
  "/updatestatus",
  authenticateToken,
  authorizeRole,
  doUpdateVideoStatus
);

export default reviewer;
