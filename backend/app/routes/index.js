import { Router } from "express";
import authRoutes from "./auth.routes.js";
import semesterRoutes from "./semester.routes.js";
import courseRoutes from "./course.routes.js";
import facultyRoutes from "./faculty.routes.js";
import studentRoutes from "./student.routes.js";
import sectionRoutes from "./section.routes.js";
import enrollmentRoutes from "./enrollment.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/", authRoutes);
router.use("/semesters", semesterRoutes);
router.use("/courses", courseRoutes);
router.use("/faculty", facultyRoutes);
router.use("/students", studentRoutes);
router.use("/sections", sectionRoutes);
router.use("/enrollments", enrollmentRoutes);

export default router;
