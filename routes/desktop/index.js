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

    const search_name = req.query.search;

    if (search_name != null) {
      console.log(search_name)
      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().nickName != null && doc.data().nickName != "") {
            contactlists_temp.push({
              userID: doc.data().userID,
              nickName: doc.data().nickName,
            });
          }
        });
      });
      let i = 0;
      const contactlists = [];

      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().nickName != null && doc.data().nickName != "") {
            // console.log(contactlists_temp[i].nickName.toLowerCase())
            // console.log(contactlists_temp[i].nickName.toLowerCase().includes(search_name.toLowerCase()))
            i++;
            if(contactlists_temp[i-1].nickName.toLowerCase().includes(search_name.toLowerCase())){
            contactlists.push({
              userID: doc.data().userID,
              nickName: doc.data().nickName,
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
    }
  } catch (error) {
    console.log(error);
  }
});

// router.route("/").get(contactListController.getContactList);
module.exports = router;
