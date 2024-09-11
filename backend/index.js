import express from "express";
import dotEnv from "dotenv";
import auth from "./routes/auth/auth.router.js";
import reviewer from "./routes/reviewer/reviewer.router.js";
import manager from "./routes/manager/manager.router.js";
import { handleError } from "./helpers/handleError/error.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dotEnv.config();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );

  next();
});

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});

app.get("/aa", (req, res) =>
  res.send("<h1 style='text-align: center'>LIME LIGHT</h1>")
);

// Routes
app.use("/api/auth/", auth); //Auth Roter
app.use("/api/video", reviewer); //Reviewer Router
app.use("/api/manager", manager); //Manager Router

app.use(handleError);
app.listen(port, function () {
  console.log(
    `Pappa-api started....... env = ${process.env.NODE_ENV}, port = ${port}`
  );
});
