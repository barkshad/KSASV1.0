import { getUserByEmail, createUser } from "./db";
import { hashPassword } from "./auth";

const DEFAULT_ADMIN = {
  uid: "admin_default",
  name: "System Admin",
  email: "admin@kabarak.ac.ke",
  password: "Mwahanga@1",
  role: "admin",
  status: "active",
  department: "IT Administration",
};

export async function seedAdmin() {
  try {
    const existing = await getUserByEmail(DEFAULT_ADMIN.email);
    if (existing) {
      console.log("Admin already exists");
      return false;
    }

    await createUser({
      ...DEFAULT_ADMIN,
      password: hashPassword(DEFAULT_ADMIN.password),
    });

    console.log("Admin seeded successfully");
    return true;
  } catch (error) {
    console.error("Admin seed failed:", error);
    return false;
  }
}
