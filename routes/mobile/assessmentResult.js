var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

router.get("/", (req, res, next) => {
  var assessmentScore = parseInt(req.query.score);
  var userID = req.query.id;
  var timestamp = new Date(Date.now())

  const data = {
    userID: userID,
    type: "depress",
    score: assessmentScore,
    //timestamp: FirebaseFirestore.Timestamp.fromDate(timestamp)
    //timestamp: timestamp
  };
  if (userID != 'null') {
    db.collection('User').doc(userID).collection('assessment').add(data);
  }

  var status = "";
  if (assessmentScore < 7) {
    status = "none";
  } else if (assessmentScore < 13) {
    status = "low";
  }
  else if (assessmentScore < 19) {
    status = "medium";
  }
  else {
    status = "high";
  }
  res.render("mobile/assessmentResult", {
    status
  });
});

module.exports = router;
