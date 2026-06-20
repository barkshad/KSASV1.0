import { db, collection, doc, setDoc, serverTimestamp } from './src/lib/firebase';
import { hashPassword } from './src/lib/auth';

const defaultPassword = "123456";

const users = [
  {
    uid: "LKD/001/2023",
    name: "Dr. Jane Doe",
    email: "jane.doe@kabarak.ac.ke",
    password: defaultPassword,
    role: "lecturer",
    status: "active",
  },
  {
    uid: "LKD/002/2023",
    name: "Prof. John Smith",
    email: "john.smith@kabarak.ac.ke",
    password: defaultPassword,
    role: "lecturer",
    status: "active",
  },
  {
    uid: "KAB/101/2023",
    name: "Alice Johnson",
    email: "alice.johnson@kabarak.ac.ke",
    password: defaultPassword,
    role: "student",
    status: "active",
  },
  {
    uid: "KAB/102/2023",
    name: "Bob Williams",
    email: "bob.williams@kabarak.ac.ke",
    password: defaultPassword,
    role: "student",
    status: "active",
  }
];

async function seedUsers() {
  try {
    for (const user of users) {
      const userDoc = doc(db, 'users', user.uid.replace(/\//g, '_'));
      await setDoc(userDoc, {
        ...user,
        password: hashPassword(user.password),
        createdAt: serverTimestamp()
      });
      console.log(`Created user: ${user.email}`);
    }
  } catch (err) {
    console.error("Failed to seed users:", err);
  }
}

seedUsers();
