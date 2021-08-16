var express = require("express");
var router = express.Router();
const contactListController = require("../controller/contactlist");
const { db } = require("../Database/database");

/* GET home page. */
// router.route("/").get((req, res, next) => {
//   //   let contactlist = {
//   //     jsonData: contactListController.getContactList,
//   //   };
//   //   for (var i in contactlist){
//   //   console.log(contactListController.getContactList);
//   //   }

//   let contactlists = contactListController.getContactList();
//   console.log(typeof contactlists);
//   console.log(JSON.stringify(contactlists));
//   console.log(contactlists);

//   res.render("index", {
//     contactlists: contactListController.getContactList,
//   });
// });

router.get("/", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];

    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          nickName: doc.data().nickName,
        });
      });
    });

    res.render("index", {
      contactlists,
    });
  } catch (error) {
    console.log(error);
  }
});

// router.route("/").get(contactListController.getContactList);
module.exports = router;
