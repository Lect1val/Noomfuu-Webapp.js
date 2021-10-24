var express = require("express");
var router = express.Router();
const { db, FieldValue } = require("../../Database/database");

router.get("/", async (req, res, next) => {
  var userID = req.query.id;
  var DScore = parseInt(req.query.d);
  var AScore = parseInt(req.query.a);
  var SScore = parseInt(req.query.s);
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
    // * Check DScore
    if (DScore >= 0 && DScore <= 6) {
      // ? DScore = safe
      // * Check AScore
      if (AScore >= 0 && AScore <= 5) {
        // ? AScore = safe
        // * Check SScore
        if (SScore >= 0 && SScore <= 9) {
          // ? SScore = safe
          statusRecord = "Safe";
        } else if (SScore >= 10 && SScore <= 12) {
          // ? SScore = follow
          statusRecord = "Follow";
        } else if (SScore >= 13) {
          // ! SScore = Danger
          statusRecord = "Danger";
        }
      } else if (AScore >= 6 && AScore <= 7) {
        // ? AScore = follow
        // * Check SScore
        if (SScore >= 10 && SScore <= 12) {
          // ? SScore = follow
          statusRecord = "Follow";
        } else if (SScore >= 13) {
          // ! SScore = Danger
          statusRecord = "Danger";
        }
      } else if (AScore >= 8) {
        // ! AScore = Danger
        statusRecord = "Danger";
      }
    } else if (DScore >= 7 && DScore <= 10) {
      // ? DScore = follow
      // * Check AScore
      if (AScore >= 6 && AScore <= 7) {
        // ? AScore = follow
        // * Check SScore
        if (SScore >= 10 && SScore <= 12) {
          // ? SScore = follow
          statusRecord = "Follow";
        } else if (SScore >= 13) {
          // ! SScore = Danger
          statusRecord = "Danger";
        }
      } else if (AScore >= 8) {
        // ! AScore = Danger
        statusRecord = "Danger";
      }
    } else if (DScore >= 11) {
      // ! DScore = Danger
      statusRecord = "Danger";
    }

    //* Logic Add Assessment
    if (oldAssessment[0] == undefined) {
      const data = {
        assessmentID: "1",
        userID: userID,
        type: "dass",
        Dscore: DScore,
        Ascore: AScore,
        Sscore: SScore,
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
        type: "dass",
        Dscore: DScore,
        Ascore: AScore,
        Sscore: SScore,
        timestamp: FieldValue.serverTimestamp(),
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

  res.render("mobile/assessmentDASSresult");
});

module.exports = router;
