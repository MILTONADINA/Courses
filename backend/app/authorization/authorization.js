import jwt from "jsonwebtoken";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";

export async function authenticate(req, res, next) {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  if (!match || !authConfig.secret) return res.status(401).send({ message: "Unauthorized." });

  try {
    const payload = jwt.verify(match[1], authConfig.secret);
    const session = await db.session.findOne({
      where: { token: match[1], userId: payload.userId },
      include: [{ model: db.user, as: "user" }],
    });
    if (!session || !session.user || session.expirationDate.getTime() <= Date.now()) {
      return res.status(401).send({ message: "Unauthorized." });
    }
    req.user = session.user;
    req.session = session;
    return next();
  } catch {
    return res.status(401).send({ message: "Unauthorized." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).send({ message: "Admin role required." });
  return next();
}

export function requireStudent(req, res, next) {
  if (req.user.role !== "student") return res.status(403).send({ message: "Student role required." });
  return next();
}
