import { Router } from "express";
import controller from "../controllers/semester.controller.js";
import { authenticate, requireAdmin } from "../authorization/authorization.js";

const router = Router();

router.post("/", authenticate, requireAdmin, controller.create);
router.get("/", authenticate, controller.findAll);
router.put("/:id", authenticate, requireAdmin, controller.update);
router.delete("/:id", authenticate, requireAdmin, controller.delete);

export default router;
