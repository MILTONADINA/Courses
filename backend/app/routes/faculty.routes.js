import { Router } from "express";
import controller from "../controllers/faculty.controller.js";
import { authenticate, requireAdmin } from "../authorization/authorization.js";

const router = Router();

router.get("/", authenticate, requireAdmin, controller.findAll);
router.post("/", authenticate, requireAdmin, controller.create);
router.put("/:id", authenticate, requireAdmin, controller.update);
router.delete("/:id", authenticate, requireAdmin, controller.delete);

export default router;
