var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

router.get("/", (req, res, next) => {
  res.render("desktop/nopermission");
});

module.exports = router;
