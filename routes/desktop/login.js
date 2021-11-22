var express = require("express");
var router = express.Router();
const { db, FieldValue } = require("../../Database/database");

router.get("/", (req, res, next) => {
  res.render("desktop/login");
});

router.post("/", async (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  var loginstatus = "";

  const contactListRef = db.collection("User");
  const contactlists = [];

  const adminsRef = db.collection("Admin");
  const snapshot = await adminsRef.where("username", "==", username).get();

  if (snapshot.empty) {
    loginstatus = "No_user";
    console.log(loginstatus);
    res.render("desktop/login");
  }

  snapshot.forEach(async (doc) => {
    doc.adminid, "=>", doc.data();
    if (doc.data().password == password) {
      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().nickName != null && doc.data().nickName != "") {
            contactlists.push({
              userID: doc.data().userID,
              nickName: doc.data().nickName,
            });
          }
        });
      });

      res.render("desktop/index", {
        contactlists,
      });
      loginstatus = "success";
    } else {
      console.log(username + "," + password);
      res.render("desktop/login");
      loginstatus = "wrong_password";
    }
    console.log(loginstatus);
  });
});

module.exports = router;
