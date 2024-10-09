import express from "express";

import {
  authenticateToken,
  authorizeRole,
} from "../../middlewares/auth/auth.middleware.js";
import {
  doGetCount,
  doGetList,
  doGetVideoByID,
  doGetVideoForManager,
  doChangeVideoStatus,
} from "../../controllers/manager/manager.controller.js";
const manager = express.Router();
//GET
manager.post("/getcount", authenticateToken, authorizeRole, doGetCount);

//POST
manager.post("/videolist", authenticateToken, authorizeRole, doGetList);
manager.post("/getvideobyid", authenticateToken, authorizeRole, doGetVideoByID);
manager.post(
  "/getvideos",
  authenticateToken,
  authorizeRole,
  doGetVideoForManager
);

//PATCH
manager.patch("/changestatus", [
  authenticateToken,
  authorizeRole,
  doChangeVideoStatus,
]);

export default manager;
