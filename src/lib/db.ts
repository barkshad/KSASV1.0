import { db, collection, doc, setDoc, addDoc, updateDoc, getDocs, getDoc, runTransaction, serverTimestamp } from './firebase';
import { uploadJSONToCloudinary, fetchJSONFromCloudinary } from './cloudinary';
import { validateTOTP } from './totp';

export const collections = {
  USERS: 'users',
  SESSIONS: 'sessions',
  COURSES: 'courses',
  ENROLLMENTS: 'enrollments',
  AUDIT_LOGS: 'audit_logs'
};

// ---------------------------------------------------------------------------
// Validation helpers (Phase 1.3)
// ---------------------------------------------------------------------------

/** Strips HTML tags and trims length. Used on any free-text field before write. */
function sanitizeText(input: string, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  const stripped = input.replace(/<[^>]*>/g, '');
  return stripped.trim().slice(0, maxLength);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email: string): boolean {
  return typeof email === 'string' && EMAIL_RE.test(email);
}

// IDs like "KAB/101/2023" — allow alphanumeric plus / . _ -
const ID_RE = /^[A-Za-z0-9/._-]+$/;
function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length <= 64 && ID_RE.test(id);
}

// ---------------------------------------------------------------------------
// Audit logging
// ---------------------------------------------------------------------------

export async function logAudit(user: any, actionType: string, entity: string, details: string) {
  const logRef = doc(collection(db, collections.AUDIT_LOGS));
  await setDoc(logRef, {
    timestamp: serverTimestamp(),
    userId: user?.uid || 'unknown',
    userRole: user?.role || 'unknown',
    userEmail: user?.email || 'unknown',
    actionType,
    entity,
    details: sanitizeText(details, 1000),
    ipAddress: 'device'
  });
}

// ---------------------------------------------------------------------------
// Session lifecycle
// ---------------------------------------------------------------------------

/**
 * Creates a new attendance session. Centralizes what Dashboard.tsx's
 * handleStartSession used to do inline, with added validation.
 */
export async function createSession(params: {
  courseCode: string;
  courseName: string;
  lecturerId: string;
  lecturerName: string;
  room: string;
  totpSecret: string;
  windowMinutes?: number;
  enrolledCount?: number;
}): Promise<string> {
  const courseCode = sanitizeText(params.courseCode, 50);
  const courseName = sanitizeText(params.courseName, 200);
  const room = sanitizeText(params.room, 100);

  if (!courseCode) throw new Error('Course code is required');
  if (!courseName) throw new Error('Course name is required');
  if (!isValidId(params.lecturerId)) throw new Error('Invalid lecturer ID');
  if (!params.totpSecret || params.totpSecret.length < 16) {
    throw new Error('A valid TOTP secret is required to start a session');
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const newSessionRef = await addDoc(collection(db, collections.SESSIONS), {
    courseCode,
    courseName,
    lecturerId: params.lecturerId,
    lecturerName: sanitizeText(params.lecturerName, 100) || 'Lecturer',
    room,
    date: dateStr,
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    windowMinutes: params.windowMinutes ?? 15,
    status: 'open',
    totpSecret: params.totpSecret,
    enrolledCount: params.enrolledCount ?? 50,
    createdAt: serverTimestamp()
  });

  return newSessionRef.id;
}

/**
 * Closes a session: marks it closed in Firestore, then archives attendance
 * to Cloudinary. This was previously inlined separately in Dashboard.tsx
 * (updateDoc + archiveSession) and called as a single function from
 * LiveSession.tsx/App.tsx without ever being defined here — that mismatch
 * was a real bug (ReferenceError on close). Both call sites now use this.
 */
export async function closeSession(sessionId: string, lecturerUid: string): Promise<void> {
  if (!isValidId(sessionId)) throw new Error('Invalid session ID');

  const sessionDocRef = doc(db, collections.SESSIONS, sessionId);
  const sessionDoc = await getDoc(sessionDocRef);
  if (!sessionDoc.exists()) throw new Error('Session not found');

  const sessionData = sessionDoc.data();
  if (sessionData.status === 'closed') {
    // Already closed — nothing to do, avoid double-archiving.
    return;
  }

  await updateDoc(sessionDocRef, {
    status: 'closed',
    closedBy: lecturerUid || 'unknown',
    closedAt: serverTimestamp()
  });

  await archiveSession(sessionId);
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export async function checkInStudent(sessionId: string, studentData: any, token: string, deviceFingerprint: string) {
  if (!isValidId(sessionId)) throw new Error('Invalid session ID');

  const sessionDocRef = doc(db, collections.SESSIONS, sessionId);
  const sessionDoc = await getDoc(sessionDocRef);

  if (!sessionDoc.exists()) throw new Error('Session not found');
  const sessionData = sessionDoc.data();

  if (sessionData.status !== 'open') throw new Error('Session is closed');

  // TOTP validation was previously missing here entirely — checkInStudent
  // trusted the caller (CheckIn.tsx) to have validated the token already.
  // Re-validating server-side-equivalent (still client SDK, but at the
  // single choke point all check-ins pass through) closes that gap.
  if (!sessionData.totpSecret || !validateTOTP(sessionData.totpSecret, token)) {
    throw new Error('Invalid or expired QR code. Please ask your lecturer to refresh and try again.');
  }

  const studentId = studentData.uid || studentData.id;
  const studentName = sanitizeText(studentData.name || 'Unknown Student', 100);

  if (!studentId || !isValidId(studentId)) {
    throw new Error('Student ID not found or invalid. Please log out and log in again.');
  }

  const attendanceDocId = studentId.replace(/\//g, '_').replace(/\s+/g, '_');
  const attendanceRef = doc(db, `${collections.SESSIONS}/${sessionId}/attendance`, attendanceDocId);

  await runTransaction(db, async (transaction) => {
    const attendanceDoc = await transaction.get(attendanceRef);
    if (attendanceDoc.exists()) {
      throw new Error('You have already been marked present for this session');
    }

    const now = new Date();
    const sessionStart = sessionData.startTime;
    let status = 'present';
    try {
      const [startHour, startMin] = sessionStart.split(':').map(Number);
      const sessionStartMs = new Date();
      sessionStartMs.setHours(startHour, startMin, 0, 0);
      const diffMinutes = (now.getTime() - sessionStartMs.getTime()) / 60000;
      if (diffMinutes > (sessionData.windowMinutes || 15)) {
        status = 'late';
      }
    } catch (e) {
      // default to present if time parse fails
    }

    transaction.set(attendanceRef, {
      studentId,
      studentName,
      studentEmail: isValidEmail(studentData.email) ? studentData.email : '',
      timestamp: serverTimestamp(),
      deviceFingerprint: sanitizeText(deviceFingerprint, 64),
      status
    });
  });
}

// ---------------------------------------------------------------------------
// Archival
// ---------------------------------------------------------------------------

export async function archiveSession(sessionId: string) {
  const sessionDocRef = doc(db, collections.SESSIONS, sessionId);
  const sessionDoc = await getDoc(sessionDocRef);
  if (!sessionDoc.exists()) return;

  const sessionData = sessionDoc.data();

  const attendanceQuery = collection(db, `${collections.SESSIONS}/${sessionId}/attendance`);
  const attendanceSnapshot = await getDocs(attendanceQuery);

  const attendanceList = attendanceSnapshot.docs.map(d => d.data());

  const archiveData = {
    ...sessionData,
    attendance: attendanceList
  };

  await uploadJSONToCloudinary(`session_${sessionId}.json`, archiveData);

  // Mark archived in Firestore so the UI can distinguish "closed" vs
  // "closed and successfully backed up" (Phase 1.3 calls this out
  // explicitly — previously archiveSession never wrote this flag back).
  await updateDoc(sessionDocRef, { archived: true, archivedAt: serverTimestamp() });
}
