import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serviceAccount = require("../employee-task-management-b3caf-2be1300d33ab.json");

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

export { db };
