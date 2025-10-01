import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serviceAccount = require("../employee-task-management-b3caf-firebase-adminsdk-fbsvc-da35757b36.json");

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

export { db };
