var express = require("express");
var router = express.Router();
const { db, FieldValue } = require("../../Database/database");

router.get("/", async (req, res, next) => {
  var assessmentScore = parseInt(req.query.score);
  var userID = req.query.id;
  var status = "";
  var statusRecord = "";

  const oldAssessment = [];
  const oldAssessmentID = await db
    .collection("User")
    .doc(userID)
    .collection("assessment")
    .orderBy("assessmentID", "desc")
    .limit(1)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        oldAssessment.push({
          assessmentID: doc.data().assessmentID,
        });
      });
    });

  if (userID != "null") {
    // *Check Assessment Score
    if (assessmentScore < 7) {
      status = "none";
      statusRecord = "Safe";
    } else if (assessmentScore < 13) {
      status = "low";
      statusRecord = "Safe";
    } else if (assessmentScore < 19) {
      status = "medium";
      statusRecord = "Follow";
    } else {
      status = "high";
      statusRecord = "Danger";
    }

    //* Logic Add Assessment 
    if (oldAssessment[0] == undefined) {
      const data = {
        assessmentID: "1",
        userID: userID,
        type: "depress",
        score: assessmentScore,
        timestamp: FieldValue.serverTimestamp(),
        status: statusRecord,
      };
      //db.collection('Assessment').add(data);
      await db
        .collection("User")
        .doc(userID)
        .collection("assessment")
        .doc("1")
        .set(data);
    } else if (oldAssessment[0] != undefined) {
      const newAssessmentID = (
        Number(oldAssessment[0].assessmentID) + 1
      ).toString();

      const data = {
        assessmentID: newAssessmentID,
        userID: userID,
        type: "depress",
        score: assessmentScore,
        timestamp: FieldValue.serverTimestamp(),
        status: statusRecord,
        //timestamp: timestamp
      };
      //db.collection('Assessment').add(data);
      await db
        .collection("User")
        .doc(userID)
        .collection("assessment")
        .doc(newAssessmentID)
        .set(data);
    }
  }

  res.render("mobile/assessmentResult", {
    status,
  });
});

module.exports = router;
