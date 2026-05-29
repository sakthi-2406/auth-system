import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";  // ✅ default import + .js extension

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

// ── Middlewares ────────────────────────────────
app.use(express.json());                          // ✅ parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // ✅ parse form data


// ── Debug: catch bad middleware ────────────────
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});


// ── Routes ────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Health check ──────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Auth API is running 🚀" });
});

// ── Start server ──────────────────────────────
connectDB()
  .then(() => {
    console.log("Db connected successfully");
    app.listen(port, () => {
      console.log(`Server listening on port : ${port}`);
    });
  })
  .catch((error) => {
    console.log("Db not connected :", error);
  });