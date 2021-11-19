var express = require("express");
var router = express.Router();
const contactListController = require("../../controller/contactlist");
var moment = require("moment");
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
    const userListRef = db.collection("User");
    const userLists = [];
    await userListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        userLists.push({
          userID: doc.data().userID,
          lineName: doc.data().lineName,
        });
      });
    });

    console.log(userLists);
    let messageUserListRef;
    const messageUserLists = [];
    const assessmentUserLists = [];
    for (let x = 0; x < userLists.length; x++) {
      messageUserListRef = db
        .collection("User")
        .doc(userLists[x].userID)
        .collection("message");
      await messageUserListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          messageUserLists.push({
            lineName: userLists[x].lineName,
            emotion: doc.data().emotion,
            timestamp: doc.data().timestamp,
          });
        });
      });
    }
    console.log(messageUserLists);

    const feelingDownLists = [];
    let scoreEmotion = 0;
    let countIndexList = 0;
    for (let L = 0; L < messageUserLists.length; L++) {
      if (L == 0) {
        feelingDownLists[0] = messageUserLists[0];
        scoreEmotion = Number(messageUserLists[0].emotion);
        feelingDownLists[0].emotion = scoreEmotion;
      } else if (L != 0) {
        if (messageUserLists[L - 1].lineName != messageUserLists[L].lineName) {
          countIndexList++;
          feelingDownLists[countIndexList] = messageUserLists[L];
          scoreEmotion = Number(messageUserLists[L].emotion);
          feelingDownLists[countIndexList].emotion = scoreEmotion;
        } else if (
          messageUserLists[L - 1].lineName == messageUserLists[L].lineName
        ) {
          scoreEmotion = scoreEmotion + Number(messageUserLists[L].emotion);
          feelingDownLists[countIndexList].emotion = scoreEmotion;
        }
      }
    }

    console.log(feelingDownLists);
    feelingDownLists.sort(function (a, b) {
      return a.emotion - b.emotion;
    });
    console.log("-" + feelingDownLists.length);
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
        feelingDownLists,
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
        feelingDownLists,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// router.route("/").get(contactListController.getContactList);
module.exports = router;
