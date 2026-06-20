import CryptoJS from "crypto-js";
import { getUserByEmail, createUser, setCurrentUser, clearCurrentUser, logAudit } from "./db";

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

export async function login(email: string, password: string, role: string) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("User not found");

  const hashedInput = hashPassword(password);
  // Check both hashed and plain (for legacy/compatibility)
  if (user.password !== hashedInput && user.password !== password) {
    throw new Error("Invalid password");
  }

  if (user.role !== role) {
    throw new Error(`This account is registered as a ${user.role}, not ${role}`);
  }

  if (user.status === "inactive") {
    throw new Error("Account is inactive. Contact admin.");
  }

  const sessionUser = {
    uid: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentNumber: user.studentNumber || null,
    department: user.department || null,
    course: user.course || null,
    year: user.year || null,
    avatar: user.avatar || null,
  };

  setCurrentUser(sessionUser);
  await logAudit("LOGIN", "user", { email, role });

  return sessionUser;
}

export async function logout() {
  const user = getCurrentUser();
  if (user) {
    await logAudit("LOGOUT", "user", { email: user.email });
  }
  clearCurrentUser();
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ksas_current_user");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated(): boolean {
  return !!getCurrentUser();
}

export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

export async function registerUser(userData: any) {
  const existing = await getUserByEmail(userData.email);
  if (existing) throw new Error("Email already registered");

  const hashedPassword = hashPassword(userData.password);
  const id = await createUser({
    ...userData,
    password: hashedPassword,
    status: "active",
  });

  await logAudit("REGISTER", "user", { email: userData.email, role: userData.role });
  return id;
}

export async function changePassword(userId: string, newPassword: string) {
  const hashed = hashPassword(newPassword);
  const { updateUser } = await import("./db");
  await updateUser(userId, { password: hashed });
}
