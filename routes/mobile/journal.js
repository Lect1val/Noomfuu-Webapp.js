var express = require("express");
var router = express.Router();
const { db, FieldValue } = require("../../Database/database");

router.get("/", (req, res, next) => {
  res.render("mobile/welcomeJournal");
});

router.get("/:userID", async (req, res, next) => {
  const userID = req.params.userID;

  const journalRef = db.collection("User").doc(userID).collection("journal");
  const journals = [];

  const snapshot = await journalRef.orderBy("journalID", "asc").get();

  await journalRef.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      journals.push({
        content: doc.data().content,
        timestamp: doc.data().timestamp,
      });
    });
  });

  res.render("mobile/journal", { journals, userID });
});

router.get("/:userID/add", (req, res, next) => {
  const userID = req.params.userID;
  res.render("mobile/journal_add", { userID });
});

router.post("/:userID/add", async (req, res, next) => {
  const userID = req.params.userID;

  var content = req.body.content;

  const oldJournal = [];
  const oldJournalID = await db
    .collection("User")
    .doc(userID)
    .collection("journal")
    .orderBy("journalID", "desc")
    .limit(1)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        oldJournal.push({
          content: doc.data().content,
          journalID: doc.data().journalID,
          timestamp: doc.data().timestamp,
          emotion: doc.data().emotion,
        });
      });
    });

  if (oldJournal[0] == undefined) {
    const data = {
      content: content,
      timestamp: FieldValue.serverTimestamp(),
      journalID: 1,
      emotion: "1",
    };

    db.collection("User").doc(userID).collection("journal").doc("1").set(data);
  } else if (oldJournal[0] != undefined) {
    const newJournalID = Number(oldJournal[0].journalID) + 1;
    console.log(newJournalID);
    const data = {
      content: content,
      timestamp: FieldValue.serverTimestamp(),
      journalID: newJournalID,
      emotion: "1",
    };
    //db.collection('Assessment').add(data);
    db.collection("User").doc(userID).collection("journal").doc(newJournalID.toString()).set(data);
  }

  const journalRef = db.collection("User").doc(userID).collection("journal");
  const journals = [];

  const snapshot = await journalRef.orderBy("journalID", "asc").get();

  await journalRef.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      journals.push({
        content: doc.data().content,
        timestamp: doc.data().timestamp,
      });
    });
  });

  res.render("mobile/journal", { journals, userID });
});

module.exports = router;
