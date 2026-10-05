import { Router } from "express";
import controller from "../controllers/myCourses.controller.js";
import { authenticate, requireStudent } from "../authorization/authorization.js";

const router = Router();

router.get("/", authenticate, requireStudent, controller.findMine);

export default router;
