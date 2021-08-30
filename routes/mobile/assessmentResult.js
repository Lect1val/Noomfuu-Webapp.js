var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

router.get("/", (req, res, next) => {
  var assessmentScore = req.query.score;
  const data = {
    score: assessmentScore
  };
  //db.collection('Assessment').add(data);
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
