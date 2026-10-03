import { Router } from "express";
import authRoutes from "./auth.routes.js";
import semesterRoutes from "./semester.routes.js";
import studentRoutes from "./student.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/", authRoutes);
router.use("/semesters", semesterRoutes);
router.use("/students", studentRoutes);

export default router;
