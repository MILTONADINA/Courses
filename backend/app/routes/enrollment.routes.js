import { Router } from "express";
import controller from "../controllers/enrollment.controller.js";
import { authenticate, requireStudent } from "../authorization/authorization.js";

const router = Router();
router.use(authenticate, requireStudent);
router.post("/", controller.create);
router.get("/", controller.findAll);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
