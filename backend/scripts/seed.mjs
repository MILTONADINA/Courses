import bcrypt from "bcryptjs";
import { pathToFileURL } from "url";
import db from "../app/models/index.js";

const adminFields = [
  "ADMIN_FIRST_NAME", "ADMIN_LAST_NAME", "ADMIN_EMAIL",
  "ADMIN_UNIVERSITY_ID", "ADMIN_USERNAME", "ADMIN_PASSWORD",
];

export function adminValues(environment = process.env) {
  for (const name of adminFields) {
    if (typeof environment[name] !== "string" || !environment[name].trim()) {
      throw new Error(`${name} is required for the admin seed.`);
    }
  }
  return {
    firstName: environment.ADMIN_FIRST_NAME.trim(),
    lastName: environment.ADMIN_LAST_NAME.trim(),
    email: environment.ADMIN_EMAIL.trim(),
    universityId: environment.ADMIN_UNIVERSITY_ID.trim(),
    userName: environment.ADMIN_USERNAME.trim().toLowerCase(),
    password: environment.ADMIN_PASSWORD,
    role: "admin",
  };
}

export async function seedAdmin(environment = process.env) {
  const values = adminValues(environment);
  await db.sequelize.sync();
  const existing = await db.user.findOne({ where: { userName: values.userName } });
  if (existing) return existing;
  return db.user.create({ ...values, password: await bcrypt.hash(values.password, 10) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await seedAdmin();
    process.stdout.write("Admin seed completed.\n");
  } catch (error) {
    process.stderr.write(`Admin seed failed: ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
}
