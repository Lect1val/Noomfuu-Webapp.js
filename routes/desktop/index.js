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

    let forcheckAppoinmentListRef;
    const forcheckAppoinmentList = [];
    for (let y = 0; y < userLists.length; y++) {
      if (userLists[y].lineName != "") {
        forcheckAppoinmentListRef = db
          .collection("User")
          .doc(userLists[y].userID)
          .collection("appointment");

        await forcheckAppoinmentListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            forcheckAppoinmentList.push({
              appointID: doc.data().appointID,
              userID: doc.data().userID,
              studentID: doc.data().studentID,
              fullname: doc.data().fullname,
              appointmentStart: doc.data().appointmentStart,
              appointmentEnd: doc.data().appointmentEnd,
              type: doc.data().type,
              timestamp: doc.data().timestamp,
              status: doc.data().status,
              meetingurl: doc.data().meetingurl,
            });
          });
        });
      }
    }

    let date = moment();
    for (let f = 0; f < forcheckAppoinmentList.length; f++) {
      if (
        forcheckAppoinmentList[f].status == "ongoing" ||
        forcheckAppoinmentList[f].status == "done"
      ) {
        if (
          date.isAfter(
            forcheckAppoinmentList[f].appointmentEnd.toDate().toUTCString()
          )
        ) {
          const autoUpdateAppointment = db
            .collection("User")
            .doc(forcheckAppoinmentList[f].userID)
            .collection("appointment")
            .doc(forcheckAppoinmentList[f].appointID.toString());
          await autoUpdateAppointment.update({
            status: "done",
          });
        }
      }
    }

    let messageUserListRef;
    let assessmentUserListsRef;
    let appointmentUserListsRef;
    const messageUserLists = [];
    const assessmentUserLists = [];
    const appointmentUserLists = [];
    for (let x = 0; x < userLists.length; x++) {
      if (userLists[x].lineName != "") {
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

        assessmentUserListsRef = db
          .collection("User")
          .doc(userLists[x].userID)
          .collection("assessment")
          .where("status", "==", "Danger");

        await assessmentUserListsRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            if (doc.data().type == "dass") {
              assessmentUserLists.push({
                lineName: userLists[x].lineName,
                type: doc.data().type,
                timestamp: doc.data().timestamp,
                status: doc.data().status,
                Ascore: doc.data().Ascore,
                Dscore: doc.data().Dscore,
                Sscore: doc.data().Sscore,
                scoreTotal:
                  Number(doc.data().Ascore) +
                  Number(doc.data().Dscore) +
                  Number(doc.data().Sscore),
              });
            } else if (doc.data().type == "depress") {
              assessmentUserLists.push({
                lineName: userLists[x].lineName,
                type: doc.data().type,
                timestamp: doc.data().timestamp,
                status: doc.data().status,
                score: doc.data().score,
              });
            }
          });
        });

        appointmentUserListsRef = db
          .collection("User")
          .doc(userLists[x].userID)
          .collection("appointment")
          .orderBy("appointmentStart", "asc");
        await appointmentUserListsRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            if (doc.data().status == "ongoing") {
              appointmentUserLists.push({
                lineName: userLists[x].lineName,
                appointID: doc.data().appointID,
                userID: doc.data().userID,
                studentID: doc.data().studentID,
                fullname: doc.data().fullname,
                appointmentStart: doc.data().appointmentStart,
                appointmentEnd: doc.data().appointmentEnd,
                type: doc.data().type,
                timestamp: doc.data().timestamp,
                status: doc.data().status,
                meetingurl: doc.data().meetingurl,
              });
            }
          });
        });
      }
    }

    appointmentUserLists.sort(function (a, b) {
      return a.appointmentStart - b.appointmentStart;
    });

    console.log("----");
    console.log(appointmentUserLists);
    console.log(
      moment(appointmentUserLists[0].timestamp.toDate().toDateString()).format(
        "ddd DD MMM YYYY"
      )
    );

    // ดึงข้อมูล Feeling down ไปแสดงในหน้า  Index
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

    feelingDownLists.sort(function (a, b) {
      return a.emotion - b.emotion;
    });

    // ดึงข้อมูล Risk User ไปแสดงในหน้า  Index
    const riskUserLists = [];
    let score = 0;
    let countIndexLists = 0;
    for (let K = 0; K < assessmentUserLists.length; K++) {
      if (K == 0) {
        if (assessmentUserLists[K].type == "dass") {
          riskUserLists[0] = assessmentUserLists[0];
          score = Number(assessmentUserLists[0].scoreTotal);
          riskUserLists[0].scoreTotal = score;
        } else if (assessmentUserLists[K].type == "depress") {
          riskUserLists[0] = assessmentUserLists[0];
          score = Number(assessmentUserLists[0].score);
          riskUserLists[0].score = score;
        }
      } else if (K != 0) {
        if (
          assessmentUserLists[K - 1].lineName != assessmentUserLists[K].lineName
        ) {
          countIndexLists++;
          if (assessmentUserLists[K].type == "dass") {
            riskUserLists[countIndexLists] = assessmentUserLists[K];
            score = Number(assessmentUserLists[K].scoreTotal);
            riskUserLists[countIndexLists].scoreTotal = score;
          } else if (assessmentUserLists[K].type == "depress") {
            riskUserLists[countIndexLists] = assessmentUserLists[K];
            score = Number(assessmentUserLists[K].score);
            riskUserLists[countIndexLists].score = score;
          }
        } else if (
          assessmentUserLists[K - 1].lineName == assessmentUserLists[K].lineName
        ) {
          if (assessmentUserLists[K].type == "dass") {
            score = score + Number(assessmentUserLists[K].scoreTotal);
            riskUserLists[countIndexLists].scoreTotal = score;
          } else if (assessmentUserLists[K].type == "depress") {
            score = score + Number(assessmentUserLists[K].score);
            riskUserLists[countIndexLists].score = score;
          }
        }
      }
    }

    riskUserLists.sort(function (a, b) {
      return b.emotion - a.emotion;
    });

    const contactListRef = db.collection("User");
    const contactlists_temp = [];
    const contactlists = [];

    const search_name = req.query.search;

    if (search_name != null) {
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
        riskUserLists,
        moment: moment,
        appointmentUserLists,
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
        riskUserLists,
        moment: moment,
        appointmentUserLists,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// router.route("/").get(contactListController.getContactList);
module.exports = router;
