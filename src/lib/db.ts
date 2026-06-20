import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { uploadJSONToCloudinary, fetchJSONFromCloudinary } from "./cloudinary";

// ==================== LOCAL STORAGE HELPERS ====================

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ksas_current_user");
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user: any) {
  localStorage.setItem("ksas_current_user", JSON.stringify(user));
}

export function clearCurrentUser() {
  localStorage.removeItem("ksas_current_user");
}

// ==================== USERS ====================

export async function getUserByEmail(email: string) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getUserById(id: string) {
  const snap = await getDoc(doc(db, "users", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createUser(userData: any) {
  const id = userData.uid || userData.id || crypto.randomUUID();
  await setDoc(doc(db, "users", id), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await backupUsersToCloudinary();
  return id;
}

export async function updateUser(id: string, updates: any) {
  await updateDoc(doc(db, "users", id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  await backupUsersToCloudinary();
}

export async function deleteUser(id: string) {
  await deleteDoc(doc(db, "users", id));
  await backupUsersToCloudinary();
}

export async function getAllUsers(): Promise<any[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUsersByRole(role: string): Promise<any[]> {
  const q = query(collection(db, "users"), where("role", "==", role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function backupUsersToCloudinary() {
  try {
    const allUsers = await getAllUsers();
    await uploadJSONToCloudinary(allUsers, "users");
  } catch (e) {
    console.error("Cloudinary backup failed:", e);
  }
}

// ==================== COURSES ====================

export async function getAllCourses(): Promise<any[]> {
  const snap = await getDocs(collection(db, "courses"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createCourse(courseData: any) {
  const id = courseData.id || crypto.randomUUID();
  await setDoc(doc(db, "courses", id), {
    ...courseData,
    id,
    createdAt: serverTimestamp(),
  });
  await backupCoursesToCloudinary();
  return id;
}

export async function updateCourse(id: string, updates: any) {
  await updateDoc(doc(db, "courses", id), updates);
  await backupCoursesToCloudinary();
}

export async function deleteCourse(id: string) {
  await deleteDoc(doc(db, "courses", id));
  await backupCoursesToCloudinary();
}

async function backupCoursesToCloudinary() {
  try {
    const allCourses = await getAllCourses();
    await uploadJSONToCloudinary(allCourses, "courses");
  } catch (e) {
    console.error("Cloudinary backup failed:", e);
  }
}

// ==================== ENROLLMENTS ====================

export async function getEnrollmentsByCourse(courseId: string): Promise<any[]> {
  const q = query(collection(db, "enrollments"), where("courseId", "==", courseId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getEnrollmentsByStudent(studentId: string): Promise<any[]> {
  const q = query(collection(db, "enrollments"), where("studentId", "==", studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getEnrollment(courseId: string, studentId: string) {
  const snap = await getDoc(doc(db, "enrollments", `${studentId}_${courseId}`));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createEnrollment(data: { studentId: string; courseId: string }) {
  const id = `${data.studentId}_${data.courseId}`;
  await setDoc(doc(db, "enrollments", id), {
    ...data,
    id,
    enrolledAt: serverTimestamp(),
  });
}

export async function deleteEnrollment(studentId: string, courseId: string) {
  await deleteDoc(doc(db, "enrollments", `${studentId}_${courseId}`));
}

// ==================== SESSIONS ====================

export async function createSession(sessionData: any) {
  const id = sessionData.id || `KSA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  await setDoc(doc(db, "sessions", id), {
    ...sessionData,
    id,
    status: "open",
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function getSession(id: string) {
  const snap = await getDoc(doc(db, "sessions", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getActiveSessions(): Promise<any[]> {
  const q = query(collection(db, "sessions"), where("status", "==", "open"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSessionsByLecturer(lecturerId: string): Promise<any[]> {
  const q = query(
    collection(db, "sessions"),
    where("lecturerId", "==", lecturerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSessionsByCourse(courseId: string): Promise<any[]> {
  const q = query(
    collection(db, "sessions"),
    where("courseId", "==", courseId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRecentSessions(limitCount: number = 10): Promise<any[]> {
  const q = query(collection(db, "sessions"), orderBy("createdAt", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateSession(id: string, updates: any) {
  await updateDoc(doc(db, "sessions", id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function closeSession(id: string) {
  const session = await getSession(id);
  if (!session) return;

  // Get all attendance records
  const attendance = await getAttendanceRecords(id);

  // Archive to Cloudinary
  const archiveData = {
    ...session,
    attendance,
    closedAt: new Date().toISOString(),
  };
  try {
    await uploadJSONToCloudinary(archiveData, `sessions_archive/${id}`);
  } catch (e) {
    console.error("Archive upload failed:", e);
  }

  // Mark as closed in Firestore
  await updateDoc(doc(db, "sessions", id), {
    status: "closed",
    closedAt: serverTimestamp(),
  });
}

// ==================== ATTENDANCE (REAL-TIME) ====================

export async function recordAttendance(sessionId: string, record: any) {
  const recordId = `${record.studentId}_${Date.now()}`;
  await setDoc(doc(db, "sessions", sessionId, "attendance", recordId), {
    ...record,
    id: recordId,
    timestamp: serverTimestamp(),
  });
  return recordId;
}

export async function getAttendanceRecords(sessionId: string): Promise<any[]> {
  const snap = await getDocs(collection(db, "sessions", sessionId, "attendance"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function hasStudentCheckedIn(sessionId: string, studentId: string): Promise<boolean> {
  const q = query(
    collection(db, "sessions", sessionId, "attendance"),
    where("studentId", "==", studentId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function hasDeviceCheckedIn(sessionId: string, fingerprint: string): Promise<boolean> {
  const q = query(
    collection(db, "sessions", sessionId, "attendance"),
    where("deviceFingerprint", "==", fingerprint)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export function subscribeToAttendance(
  sessionId: string,
  callback: (records: any[]) => void
) {
  return onSnapshot(collection(db, "sessions", sessionId, "attendance"), (snap) => {
    const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(records);
  });
}

export function subscribeToSession(
  sessionId: string,
  callback: (session: any) => void
) {
  return onSnapshot(doc(db, "sessions", sessionId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

export function subscribeToActiveSessions(callback: (sessions: any[]) => void) {
  const q = query(collection(db, "sessions"), where("status", "==", "open"));
  return onSnapshot(q, (snap) => {
    const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(sessions);
  });
}

// ==================== BULK IMPORT ====================

export async function bulkImportStudents(students: any[]) {
  const batch = writeBatch(db);
  const usersCol = collection(db, "users");

  for (const student of students) {
    const id = student.uid || student.id || crypto.randomUUID();
    const ref = doc(usersCol, id);
    batch.set(ref, {
      ...student,
      role: "student",
      status: "active",
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  await backupUsersToCloudinary();
}

export async function bulkImportLecturers(lecturers: any[]) {
  const batch = writeBatch(db);
  const usersCol = collection(db, "users");

  for (const lecturer of lecturers) {
    const id = lecturer.uid || lecturer.id || crypto.randomUUID();
    const ref = doc(usersCol, id);
    batch.set(ref, {
      ...lecturer,
      role: "lecturer",
      status: "active",
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  await backupUsersToCloudinary();
}

// ==================== AUDIT LOG ====================

export async function logAudit(action: string, entity: string, details: any) {
  await setDoc(doc(collection(db, "audit_logs")), {
    action,
    entity,
    details,
    timestamp: serverTimestamp(),
    userId: getCurrentUser()?.uid || "anonymous",
    userEmail: getCurrentUser()?.email || "anonymous",
  });
}

export async function getAuditLogs(limitCount: number = 100): Promise<any[]> {
  const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ==================== SETTINGS ====================

export async function getSettings() {
  const snap = await getDoc(doc(db, "settings", "global"));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function updateSettings(settings: any) {
  await setDoc(doc(db, "settings", "global"), settings, { merge: true });
  try {
    await uploadJSONToCloudinary(settings, "settings");
  } catch (e) {
    console.error("Settings backup failed:", e);
  }
}

// ==================== ANALYTICS HELPERS ====================

export async function getStudentAttendanceStats(studentId: string) {
  const enrollments = await getEnrollmentsByStudent(studentId);
  const courseIds = enrollments.map((e) => e.courseId);

  let totalSessions = 0;
  let attendedSessions = 0;
  let lateSessions = 0;
  let absentSessions = 0;

  for (const courseId of courseIds) {
    const sessions = await getSessionsByCourse(courseId);
    for (const session of sessions) {
      if (session.status === "closed") {
        totalSessions++;
        const records = await getAttendanceRecords(session.id);
        const record = records.find((r: any) => r.studentId === studentId);
        if (record) {
          if (record.status === "present") attendedSessions++;
          else if (record.status === "late") lateSessions++;
        } else {
          absentSessions++;
        }
      }
    }
  }

  const total = totalSessions || 1;
  return {
    totalSessions,
    attendedSessions,
    lateSessions,
    absentSessions,
    attendanceRate: Math.round((attendedSessions / total) * 100),
    coursesEnrolled: courseIds.length,
  };
}

export async function getCourseAttendanceStats(courseId: string) {
  const sessions = await getSessionsByCourse(courseId);
  const enrollments = await getEnrollmentsByCourse(courseId);
  const totalStudents = enrollments.length;

  let totalAttendance = 0;
  let sessionCount = 0;

  for (const session of sessions) {
    if (session.status === "closed") {
      const records = await getAttendanceRecords(session.id);
      totalAttendance += records.length;
      sessionCount++;
    }
  }

  const avgAttendance = sessionCount > 0 ? Math.round(totalAttendance / sessionCount) : 0;
  const avgRate = totalStudents > 0 ? Math.round((avgAttendance / totalStudents) * 100) : 0;

  return {
    totalSessions: sessions.length,
    closedSessions: sessionCount,
    totalStudents,
    avgAttendance,
    avgRate,
  };
}

export async function getAtRiskStudents(courseId: string, threshold: number = 75) {
  const enrollments = await getEnrollmentsByCourse(courseId);
  const sessions = await getSessionsByCourse(courseId);
  const closedSessions = sessions.filter((s) => s.status === "closed");

  const atRisk: any[] = [];

  for (const enrollment of enrollments) {
    let attended = 0;
    for (const session of closedSessions) {
      const records = await getAttendanceRecords(session.id);
      if (records.find((r: any) => r.studentId === enrollment.studentId)) {
        attended++;
      }
    }

    const rate = closedSessions.length > 0 ? Math.round((attended / closedSessions.length) * 100) : 0;
    if (rate < threshold) {
      const student = await getUserById(enrollment.studentId);
      atRisk.push({
        studentId: enrollment.studentId,
        name: student?.name || "Unknown",
        studentNumber: student?.studentNumber || "N/A",
        attendanceRate: rate,
        sessionsAttended: attended,
        totalSessions: closedSessions.length,
      });
    }
  }

  return atRisk.sort((a, b) => a.attendanceRate - b.attendanceRate);
}

// ==================== CSV EXPORT ====================

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
