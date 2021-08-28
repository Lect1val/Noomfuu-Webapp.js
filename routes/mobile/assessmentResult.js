var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

router.get("/", (req, res, next) => {
  console.log(req.query.score);
  var assessmentScore = req.query.score;
  const data = {
    score: assessmentScore
  };
  //db.collection('Assessment').add(data);
  db.collection('User').doc('user2').collection('assessment').add(data);
  res.render("mobile/assessmentResult");
});

module.exports = router;
