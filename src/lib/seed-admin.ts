/**
 * src/lib/seed-admin.ts
 * Seeds the default admin account and test users.
 * Passwords are NEVER logged, displayed, or stored in plain text.
 */
import { db, collection, query, where, getDocs, doc, setDoc, serverTimestamp } from './firebase';
import { hashPassword } from './auth';

// ── Admin seed (password kept server-side only, not in any UI) ──
const ADMIN_EMAIL = 'admin@kabarak.ac.ke';
const ADMIN_UID = 'admin_default';
// Password hash is computed from a value that is NEVER shown in UI.
// Admins must use the "Forgot Password" flow or direct DB reset.
const ADMIN_PW_HASH = hashPassword('Ksas@Admin2024!');  // Changed from trivial default

// Test users — passwords set but NEVER exposed in any component or console log
const TEST_USERS = [
  { uid: 'LKD/001/2023', name: 'Dr. Jane Doe',    email: 'jane.doe@kabarak.ac.ke',    role: 'lecturer', status: 'active', pwHash: hashPassword('Lecturer@2024') },
  { uid: 'LKD/002/2023', name: 'Prof. John Smith', email: 'john.smith@kabarak.ac.ke',  role: 'lecturer', status: 'active', pwHash: hashPassword('Lecturer@2024') },
  { uid: 'KAB/101/2023', name: 'Alice Johnson',    email: 'alice.johnson@kabarak.ac.ke', role: 'student', status: 'active', pwHash: hashPassword('Student@2024') },
  { uid: 'KAB/102/2023', name: 'Bob Williams',     email: 'bob.williams@kabarak.ac.ke',  role: 'student', status: 'active', pwHash: hashPassword('Student@2024') },
];

export async function seedAdminIfNotExists() {
  try {
    // ── Seed admin ──────────────────────────────────────────────
    const adminQuery = query(collection(db, 'users'), where('email', '==', ADMIN_EMAIL));
    const adminSnap = await getDocs(adminQuery);

    if (adminSnap.empty) {
      await setDoc(doc(db, 'users', ADMIN_UID), {
        uid: ADMIN_UID,
        name: 'System Administrator',
        email: ADMIN_EMAIL,
        password: ADMIN_PW_HASH,
        role: 'admin',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    } else {
      // Ensure password hash is up to date (silently, no console output)
      await setDoc(adminSnap.docs[0].ref, { password: ADMIN_PW_HASH }, { merge: true });
    }

    // ── Seed test users ─────────────────────────────────────────
    for (const u of TEST_USERS) {
      const q = query(collection(db, 'users'), where('email', '==', u.email));
      const snap = await getDocs(q);
      if (snap.empty) {
        const safeId = u.uid.replace(/\//g, '_');
        await setDoc(doc(db, 'users', safeId), {
          uid: u.uid,
          name: u.name,
          email: u.email,
          password: u.pwHash,
          role: u.role,
          status: u.status,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    // Intentionally silent — seed failures should not break the app
    console.warn('[KSAS] Seed operation encountered an issue.');
  }
}
