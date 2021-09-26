const admin = require("firebase-admin");

const serviceAccount = require("./noomfuuproject-f3b69-firebase-adminsdk-mpbf0-0db0cba4ee.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const storage = admin.storage();
const FieldValue = admin.firestore.FieldValue;

module.exports = { db, storage, FieldValue };
