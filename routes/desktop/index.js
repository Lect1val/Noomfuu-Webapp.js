var express = require("express");
var router = express.Router();
const contactListController = require("../../controller/contactlist");
const { db } = require("../../Database/database");

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
    const contactlists_temp = [];
    const contactlists = [];

    const search_name = req.query.search;

    if (search_name != null) {
      console.log(search_name);
      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            contactlists_temp.push({
              userID: doc.data().userID,
              lineName: doc.data().lineName,
            });
          }
        });
      });
      let i = 0;

      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            i++;
            if (
              contactlists_temp[i - 1].lineName
                .toLowerCase()
                .includes(search_name.toLowerCase())
            ) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/index", {
        contactlists,
      });
    } else {
      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            contactlists.push({
              userID: doc.data().userID,
              lineName: doc.data().lineName,
            });
          }
        });
      });

      res.render("desktop/index", {
        contactlists,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// router.route("/").get(contactListController.getContactList);
module.exports = router;
