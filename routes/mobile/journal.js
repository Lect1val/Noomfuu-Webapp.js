var express = require("express");
var router = express.Router();
const { db, FieldValue } = require("../../Database/database");

router.get("/", (req, res, next) => {
  res.render("mobile/welcomeJournal");
});

router.get("/:userID", async (req, res, next) => {
    const userID = req.params.userID
    
    const journalRef = db.collection('User').doc(userID).collection('Journal');
    const journals = [];

    const snapshot = await journalRef.get();

    await journalRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
            journals.push({
              content: doc.data().content,
              timestamp: doc.data().timestamp,
            });
        });
      });

      console.log(journals)

    res.render("mobile/journal", {journals});
  });

module.exports = router;
