var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

router.get("/", (req, res, next) => {
  var userID = parseInt(req.query.id);
  res.render("mobile/assessment9Q", userID);
});

module.exports = router;
