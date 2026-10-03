import { Router } from "express";
import authRoutes from "./auth.routes.js";
import semesterRoutes from "./semester.routes.js";
import courseRoutes from "./course.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/", authRoutes);
router.use("/semesters", semesterRoutes);
router.use("/courses", courseRoutes);

export default router;
