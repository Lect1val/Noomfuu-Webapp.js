var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("note_content", { title: "Express" });
// });

router.get("/", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];

    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          id: doc.data().id,
          nickName: doc.data().nickName,
        });
      });
    });

    res.render("desktop/note_content", {
      contactlists,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;