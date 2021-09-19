var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

router.get("/", (req, res, next) => {
  var userID = req.query.id;
  var DScore = parseInt(req.query.d);
  var AScore = parseInt(req.query.a);
  var SScore = parseInt(req.query.s);
  const data = {
    userID: userID,
    type: "dass",
    Dscore: DScore,
    Ascore: AScore,
    Sscore: SScore,
  };
  //db.collection('Assessment').add(data);
  db.collection('User').doc(userID).collection('assessment').add(data);

  res.render("mobile/assessmentDASSresult")
});

module.exports = router;
