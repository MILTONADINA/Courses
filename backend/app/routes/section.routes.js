import { Router } from "express";
import controller from "../controllers/section.controller.js";
import { authenticate, requireAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", authenticate, controller.findAll);
router.get("/:id/students", authenticate, requireAdmin, controller.findStudents);
router.post("/", authenticate, requireAdmin, controller.create);
router.put("/:id", authenticate, requireAdmin, controller.update);
router.delete("/:id", authenticate, requireAdmin, controller.delete);

export default router;
