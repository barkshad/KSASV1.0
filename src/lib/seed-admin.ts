import { db, collection, query, where, getDocs, doc, setDoc, serverTimestamp } from './firebase';
import { hashPassword } from './auth';
import { uploadJSONToCloudinary, fetchJSONFromCloudinary } from './cloudinary';

export const ADMIN_SEED = {
  uid: "admin_default",
  name: "System Administrator",
  email: "admin@kabarak.ac.ke",
  password: "12345678",
  role: "admin",
  status: "active",
};

export async function seedAdminIfNotExists() {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', ADMIN_SEED.email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const adminDoc = doc(db, 'users', ADMIN_SEED.uid);
      await setDoc(adminDoc, {
        ...ADMIN_SEED,
        password: hashPassword(ADMIN_SEED.password),
        createdAt: serverTimestamp()
      });
    } else {
      // Force password update to ensure default credentials work
      const docRef = snapshot.docs[0].ref;
      await setDoc(docRef, {
        ...snapshot.docs[0].data(),
        password: hashPassword(ADMIN_SEED.password)
      }, { merge: true });
    }

    // Also backup to cloudinary users.json
    try {
       const existingUsers = await fetchJSONFromCloudinary('users.json') || [];
       const exists = existingUsers.some((u: any) => u.email === ADMIN_SEED.email);
       if (!exists) {
           existingUsers.push(ADMIN_SEED);
           await uploadJSONToCloudinary('users.json', existingUsers);
       }
    } catch (err) {
       console.error("Cloudinary backup failed during seed", err);
    }
  } catch (err) {
    console.error("Failed to execute admin seed", err);
  }

  // Seed extra test users (lecturers and students)
  try {
    const defaultPassword = "123456";
    const extraUsers = [
      { uid: "LKD/001/2023", name: "Dr. Jane Doe", email: "jane.doe@kabarak.ac.ke", password: defaultPassword, role: "lecturer", status: "active" },
      { uid: "LKD/002/2023", name: "Prof. John Smith", email: "john.smith@kabarak.ac.ke", password: defaultPassword, role: "lecturer", status: "active" },
      { uid: "KAB/101/2023", name: "Alice Johnson", email: "alice.johnson@kabarak.ac.ke", password: defaultPassword, role: "student", status: "active" },
      { uid: "KAB/102/2023", name: "Bob Williams", email: "bob.williams@kabarak.ac.ke", password: defaultPassword, role: "student", status: "active" }
    ];
    
    for (const u of extraUsers) {
      const q = query(collection(db, 'users'), where('email', '==', u.email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await setDoc(doc(db, 'users', u.uid.replace(/\//g, '_')), {
          ...u,
          password: hashPassword(u.password),
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (e) {
    console.error("Failed to seed extra users", e);
  }
}

