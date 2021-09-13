var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

router.get("/", (req, res, next) => {
  var assessmentScore = parseInt(req.query.score);
  var timestamp = new Date(Date.now()).toString()
  console.log(timestamp)
  const data = {
    type: "depress",
    score: assessmentScore,
    //timestamp: firebase.firestore.Timestamp.fromDate(timestamp)
    //timestamp: timestamp
  };
  
  db.collection('User').doc('user2').collection('assessment').add(data);

  var status = "";
  if(assessmentScore < 7){
    status = "none";
  } else if (assessmentScore < 13){
    status = "low";
  }
  else if (assessmentScore < 19){
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
