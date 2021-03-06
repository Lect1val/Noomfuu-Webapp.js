var express = require("express");
var router = express.Router();
var moment = require("moment");
const { db, FieldValue } = require("../../Database/database");

//* เข้าหน้า User Profile
router.get("/:userID", async (req, res, next) => {
  try {
    // ดึงรูป และ line username จาก line
    const getUserID = req.params.userID;
    const line = require("@line/bot-sdk");
    let urlPic = "";
    let lineName = "";
    const client = new line.Client({
      channelAccessToken:
        "9UwRYnrTQskyPOTIuEj0gv8d6YX8LPpKkh2JYOE1KqEDvHWXbXGJhFOHbBl+Ynuv5CUcBne57zh3QKNLBbHvEiYkSksux4jAGSuGwswbTSvKvBVQ88IznUuHBoBaheC56eclrcNUP7Fxw0jbHGCF/wdB04t89/1O/w1cDnyilFU=",
    });

    await client
      .getProfile(getUserID)
      .then((profile) => {
        lineName = profile.displayName;
        urlPic = profile.pictureUrl;
      })
      .catch((err) => {
        // error handling
      });

    // save line username ลง DB
    const updateProfile = db.collection("User").doc(getUserID);
    const response = await updateProfile.update({
      lineName: lineName,
    });

    // ดึงข้อมูล user ไป show ในหน้า user profile
    const profileListRef = db.collection("User");
    const profileList = [];

    await profileListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().userID == getUserID) {
          profileList.push({
            userID: doc.data().userID,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            TelNo: doc.data().TelNo,
            Email: doc.data().Email,
            contactNote: doc.data().contactNote,
            lineName: doc.data().lineName,
            nickname: doc.data().nickname,
          });
        }
      });
    });

    // ดึงข้อมูล chart emotion 7 วัน ไป show ในหน้า user profile
    const chartListRef = await db.collection("User").doc(getUserID).collection("message").orderBy("timestamp", "asc");
    const chartList = [];

    await chartListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        chartList.push({
          emotion: doc.data().emotion,
          timestamp: doc.data().timestamp,
        });
      });
    });

    const timeList = [];
    const emotionList = [];
    let scoreEmotion = 0;
    let countIndexList = 0;
    for (let L = 0; L < chartList.length; L++) {
      if (L == 0) {
        timeList[0] = chartList[0];
        scoreEmotion = Number(chartList[0].emotion);
        emotionList[0] = scoreEmotion;
      } else if (L != 0) {
        if (chartList[L - 1].timestamp.toDate().toDateString() != chartList[L].timestamp.toDate().toDateString()) {
          countIndexList++;
          timeList[countIndexList] = chartList[L];
          scoreEmotion = Number(chartList[L].emotion);
          emotionList[countIndexList] = scoreEmotion;
        } else if (chartList[L - 1].timestamp.toDate().toDateString() == chartList[L].timestamp.toDate().toDateString()) {
          scoreEmotion = scoreEmotion + Number(chartList[L].emotion);
          emotionList[countIndexList] = scoreEmotion;
        }
      }
    }

    // Auto Update Appointment Status ตามเวลานัดหมาย
    const forcheckAppoinmentListRef = db.collection("User").doc(getUserID).collection("appointment");
    const forcheckAppoinmentList = [];

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

    let date = moment();
    for (let f = 0; f < forcheckAppoinmentList.length; f++) {
      if (forcheckAppoinmentList[f].status == "ongoing" || forcheckAppoinmentList[f].status == "done") {
        if (date.isAfter(forcheckAppoinmentList[f].appointmentEnd.toDate().toUTCString())) {
          const autoUpdateAppointment = db.collection("User").doc(getUserID).collection("appointment").doc(forcheckAppoinmentList[f].appointID.toString());
          await autoUpdateAppointment.update({
            status: "done",
          });
        }
      }
    }

    // ดึงข้อมูล Appointment ที่เป็น on going
    const appointmentListRef = db.collection("User").doc(getUserID).collection("appointment").orderBy("appointmentStart", "asc");
    const appointmentOngoingLists = [];

    await appointmentListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().status == "ongoing") {
          appointmentOngoingLists.push({
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

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    //ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/user_profile", {
        contactlists,
        profileList,
        getUserID,
        emotionList,
        timeList,
        chartList,
        urlPic,
        appointmentOngoingLists,
        moment: moment,
        headerUserList,
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

      res.render("desktop/user_profile", {
        contactlists,
        profileList,
        getUserID,
        emotionList,
        timeList,
        chartList,
        urlPic,
        appointmentOngoingLists,
        moment: moment,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* แก้ไขข้อมูลในหน้า User Profile
router.post("/:userID", async (req, res, next) => {
  try {
    //รับข้อมูลที่แก้ไขมาจาก front-end
    const getUserID = req.params.userID;
    const newFirstName = req.body.new_firstName;
    const newLastName = req.body.new_lastName;
    const newTel = req.body.new_tel;
    const newEmail = req.body.new_email;
    const newContactNote = req.body.new_contactNote;

    // update ข้อมูล prodile ใน DB
    const updateProfile = db.collection("User").doc(getUserID);
    const response = await updateProfile.update({
      firstName: newFirstName,
      lastName: newLastName,
      TelNo: newTel,
      Email: newEmail,
      contactNote: newContactNote,
    });

    // ดึงข้อมูล user ไป show ในหน้า user profile หลัง update แล้ว
    const profileListRef = db.collection("User");
    const profileList = [];

    await profileListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().userID == getUserID.toString()) {
          profileList.push({
            userID: doc.data().userID,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            TelNo: doc.data().TelNo,
            Email: doc.data().Email,
            contactNote: doc.data().contactNote,
          });
        }
      });
    });

    // Auto Update Appointment Status ตามเวลานัดหมาย
    const forcheckAppoinmentListRef = db.collection("User").doc(getUserID).collection("appointment");
    const forcheckAppoinmentList = [];

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

    let date = moment();
    for (let f = 0; f < forcheckAppoinmentList.length; f++) {
      if (forcheckAppoinmentList[f].status == "ongoing" || forcheckAppoinmentList[f].status == "done") {
        if (date.isAfter(forcheckAppoinmentList[f].appointmentEnd.toDate().toUTCString())) {
          const autoUpdateAppointment = db.collection("User").doc(getUserID).collection("appointment").doc(forcheckAppoinmentList[f].appointID.toString());
          await autoUpdateAppointment.update({
            status: "done",
          });
        }
      }
    }

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    //ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.redirect("/profile/" + getUserID);
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

      res.redirect("/profile/" + getUserID);
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า Analytic
router.get("/:userID/analytic", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;

    // ดึงข้อมูล Assessment 3 อันดับล่าสุด ไป show ใน หน้า Analytic
    const assessmentListRef = await db.collection("User").doc(getUserID).collection("assessment").orderBy("timestamp", "desc").limit(3);
    const assessmentList = [];

    await assessmentListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().type == "dass") {
          assessmentList.push({
            assessmentID: doc.data().assessmentID,
            type: doc.data().type,
            timestamp: doc.data().timestamp,
            status: doc.data().status,
            Ascore: doc.data().Ascore,
            Dscore: doc.data().Dscore,
            Sscore: doc.data().Sscore,
          });
        } else if (doc.data().type == "depress") {
          assessmentList.push({
            assessmentID: doc.data().assessmentID,
            type: doc.data().type,
            timestamp: doc.data().timestamp,
            status: doc.data().status,
            score: doc.data().score,
          });
        }
      });
    });

    // ดึงข้อมูล chart emotion 14 วัน ไป show ในหน้า Analytic
    const chartListRef = await db.collection("User").doc(getUserID).collection("message").orderBy("timestamp", "asc");
    const chartList = [];

    await chartListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        chartList.push({
          emotion: doc.data().emotion,
          timestamp: doc.data().timestamp,
        });
      });
    });

    const timeList = [];
    const emotionList = [];
    let scoreEmotion = 0;
    let countIndexList = 0;
    for (let L = 0; L < chartList.length; L++) {
      if (L == 0) {
        timeList[0] = chartList[0];
        scoreEmotion = Number(chartList[0].emotion);
        emotionList[0] = scoreEmotion;
      } else if (L != 0) {
        if (chartList[L - 1].timestamp.toDate().toDateString() != chartList[L].timestamp.toDate().toDateString()) {
          countIndexList++;
          timeList[countIndexList] = chartList[L];
          scoreEmotion = Number(chartList[L].emotion);
          emotionList[countIndexList] = scoreEmotion;
        } else if (chartList[L - 1].timestamp.toDate().toDateString() == chartList[L].timestamp.toDate().toDateString()) {
          scoreEmotion = scoreEmotion + Number(chartList[L].emotion);
          emotionList[countIndexList] = scoreEmotion;
        }
      }
    }

    // ดึงข้อมูล chat 3 อันดับล่าสุด ไป show ในหน้า Analytic
    const chatListRef = await db.collection("User").doc(getUserID).collection("message").orderBy("timestamp", "desc").limit(3);
    const chatList = [];

    await chatListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        chatList.push({
          messageID: doc.data().messageID,
          emotion: doc.data().emotion,
          timestamp: doc.data().timestamp,
          content: doc.data().content,
        });
      });
    });

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    //ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/feeling_analytic", {
        contactlists,
        getUserID,
        assessmentList,
        chatList,
        chartList,
        timeList,
        emotionList,
        headerUserList,
        moment: moment,
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

      res.render("desktop/feeling_analytic", {
        contactlists,
        getUserID,
        assessmentList,
        chatList,
        chartList,
        timeList,
        emotionList,
        headerUserList,
        moment: moment,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า ALl Assessment
router.get("/:userID/assessment", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;

    // ดึงข้อมูล Assessment ทั้งหมด ไป show ใน หน้า All Assessment และ search assessment
    const assessmentListRef = await db.collection("User").doc(getUserID).collection("assessment").orderBy("timestamp", "desc");

    const search_assessment_name = req.query.searchassessment;
    const filter = req.query.filter;
    const assessmentList_temp = [];
    const assessmentList = [];

    console.log(search_assessment_name);
    if (search_assessment_name != null && filter != null && search_assessment_name != "" && filter != "") {
      await assessmentListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().type == "dass") {
            assessmentList_temp.push({
              assessmentID: doc.data().assessmentID,
              type: doc.data().type,
              timestamp: doc.data().timestamp,
              status: doc.data().status,
              Ascore: doc.data().Ascore,
              Dscore: doc.data().Dscore,
              Sscore: doc.data().Sscore,
            });
          } else if (doc.data().type == "depress") {
            assessmentList_temp.push({
              assessmentID: doc.data().assessmentID,
              type: doc.data().type,
              timestamp: doc.data().timestamp,
              status: doc.data().status,
              score: doc.data().score,
            });
          }
        });
      });
      if (filter == "state") {
        let i = 0;

        await assessmentListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            i++;
            if (assessmentList_temp[i - 1].status.toLowerCase().includes(search_assessment_name.toLocaleLowerCase())) {
              if (doc.data().type == "dass") {
                assessmentList.push({
                  assessmentID: doc.data().assessmentID,
                  type: doc.data().type,
                  timestamp: doc.data().timestamp,
                  status: doc.data().status,
                  Ascore: doc.data().Ascore,
                  Dscore: doc.data().Dscore,
                  Sscore: doc.data().Sscore,
                });
              } else if (doc.data().type == "depress") {
                assessmentList.push({
                  assessmentID: doc.data().assessmentID,
                  type: doc.data().type,
                  timestamp: doc.data().timestamp,
                  status: doc.data().status,
                  score: doc.data().score,
                });
              }
            }
          });
        });
      } else if (filter == "type") {
        let i = 0;

        await assessmentListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            i++;
            if (assessmentList_temp[i - 1].type.toLowerCase().includes(search_assessment_name.toLocaleLowerCase())) {
              if (doc.data().type == "dass") {
                assessmentList.push({
                  assessmentID: doc.data().assessmentID,
                  type: doc.data().type,
                  timestamp: doc.data().timestamp,
                  status: doc.data().status,
                  Ascore: doc.data().Ascore,
                  Dscore: doc.data().Dscore,
                  Sscore: doc.data().Sscore,
                });
              } else if (doc.data().type == "depress") {
                assessmentList.push({
                  assessmentID: doc.data().assessmentID,
                  type: doc.data().type,
                  timestamp: doc.data().timestamp,
                  status: doc.data().status,
                  score: doc.data().score,
                });
              }
            }
          });
        });
      }
    } else {
      await assessmentListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().type == "dass") {
            assessmentList.push({
              assessmentID: doc.data().assessmentID,
              type: doc.data().type,
              timestamp: doc.data().timestamp,
              status: doc.data().status,
              Ascore: doc.data().Ascore,
              Dscore: doc.data().Dscore,
              Sscore: doc.data().Sscore,
            });
          } else if (doc.data().type == "depress") {
            assessmentList.push({
              assessmentID: doc.data().assessmentID,
              type: doc.data().type,
              timestamp: doc.data().timestamp,
              status: doc.data().status,
              score: doc.data().score,
            });
          }
        });
      });
    }

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/all_assessment", {
        contactlists,
        getUserID,
        assessmentList,
        headerUserList,
        moment: moment,
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

      res.render("desktop/all_assessment", {
        contactlists,
        getUserID,
        assessmentList,
        headerUserList,
        moment: moment,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า All Chat History
router.get("/:userID/chat", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;

    // ดึงข้อมูล chat ทั้งหมด ไป show ใน หน้า All Chat และ search chat
    const chatListRef = await db.collection("User").doc(getUserID).collection("message").orderBy("timestamp", "desc");

    const search_chat_name = req.query.searchchat;
    const filter = req.query.filter;
    const chatList_temp = [];
    const chatList = [];

    if (search_chat_name != null && filter != null && search_chat_name != "" && filter != "") {
      await chatListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          chatList_temp.push({
            messageID: doc.data().messageID,
            emotion: doc.data().emotion,
            timestamp: doc.data().timestamp,
            content: doc.data().content,
          });
        });
      });
      if (filter == "chat") {
        let i = 0;

        await chatListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            i++;
            if (chatList_temp[i - 1].content.toLowerCase().includes(search_chat_name.toLowerCase())) {
              chatList.push({
                messageID: doc.data().messageID,
                emotion: doc.data().emotion,
                timestamp: doc.data().timestamp,
                content: doc.data().content,
              });
            }
          });
        });
      } else {
        let neg = "negative";
        let pos = "positive";
        let emotionNeg = "";
        let emotionPos = "";
        if (neg.includes(search_chat_name.toLocaleLowerCase())) {
          emotionNeg = "-1";
        }

        if (pos.includes(search_chat_name.toLocaleLowerCase())) {
          emotionPos = "1";
        }
        let i = 0;

        await chatListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            i++;
            if (chatList_temp[i - 1].emotion.toLowerCase() == emotionNeg || chatList_temp[i - 1].emotion.toLowerCase() == emotionPos) {
              chatList.push({
                messageID: doc.data().messageID,
                emotion: doc.data().emotion,
                timestamp: doc.data().timestamp,
                content: doc.data().content,
              });
            }
          });
        });
      }
    } else {
      await chatListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          chatList.push({
            messageID: doc.data().messageID,
            emotion: doc.data().emotion,
            timestamp: doc.data().timestamp,
            content: doc.data().content,
          });
        });
      });
    }

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/all_chat", {
        contactlists,
        getUserID,
        chatList,
        headerUserList,
        moment: moment,
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

      res.render("desktop/all_chat", {
        contactlists,
        getUserID,
        chatList,
        headerUserList,
        moment: moment,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า Appointment
router.get("/:userID/appointment", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;

    // Auto Update Appointment Status ตามเวลานัดหมาย
    const forcheckAppoinmentListRef = db.collection("User").doc(getUserID).collection("appointment");
    const forcheckAppoinmentList = [];

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

    let date = moment();
    for (let f = 0; f < forcheckAppoinmentList.length; f++) {
      if (forcheckAppoinmentList[f].status == "ongoing" || forcheckAppoinmentList[f].status == "done") {
        if (date.isAfter(forcheckAppoinmentList[f].appointmentEnd.toDate().toUTCString())) {
          const autoUpdateAppointment = db.collection("User").doc(getUserID).collection("appointment").doc(forcheckAppoinmentList[f].appointID.toString());
          await autoUpdateAppointment.update({
            status: "done",
          });
        }
      }
    }

    // ดึงข้อมูล appointment
    const appointmentListRef = db.collection("User").doc(getUserID).collection("appointment").orderBy("appointmentStart", "asc");
    const appointmentOngoingLists = [];
    const appointmentLists = [];

    await appointmentListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().status == "ongoing") {
          appointmentOngoingLists.push({
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
        } else if (doc.data().status == "done" || doc.data().status == "cancel") {
          appointmentLists.push({
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

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/appointment_all", {
        contactlists,
        getUserID,
        appointmentLists,
        appointmentOngoingLists,
        moment: moment,
        headerUserList,
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
      res.render("desktop/appointment_all", {
        contactlists,
        getUserID,
        appointmentLists,
        appointmentOngoingLists,
        moment: moment,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้าแก้ไข Appointment
router.get("/:userID/appointment/:appointID/edit", async (req, res, next) => {
  // /:appointID
  try {
    const getUserID = req.params.userID;
    const getAppointID = Number(req.params.appointID);

    const errorMessage = null;

    // ดึงข้อมูล appointment
    const appointListRef = db.collection("User").doc(getUserID).collection("appointment");
    const appointLists = [];
    await appointListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        appointLists.push({
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

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/edit_appointment", {
        contactlists,
        getAppointID,
        getUserID,
        appointLists,
        moment: moment,
        errorMessage,
        headerUserList,
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

      res.render("desktop/edit_appointment", {
        contactlists,
        getAppointID,
        getUserID,
        appointLists,
        moment: moment,
        errorMessage,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เแก้ไขข้อมูล Appointment
router.post("/:userID/appointment/:appointID", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;
    const getAppointID = Number(req.params.appointID);

    // update Appointment  ลง DB
    const newAppointDate = req.body.new_date;
    const newAppointStartTime = req.body.new_starttime + ":0000";
    const newAppointEndTime = req.body.new_endtime + ":0000";
    const newLink = req.body.new_link;
    const newType = req.body.new_type;
    const newStatus = req.body.new_status;

    const newAppointStart = new Date(newAppointDate + " " + newAppointStartTime);
    const newAppointEnd = new Date(newAppointDate + " " + newAppointEndTime);

    if (Date.parse(newAppointStart) > Date.now()) {
      const updateAppointment = db.collection("User").doc(getUserID).collection("appointment").doc(getAppointID.toString());
      const response = await updateAppointment.update({
        appointmentStart: moment(newAppointStart),
        appointmentEnd: moment(newAppointEnd),
        type: newType,
        timestamp: FieldValue.serverTimestamp(),
        status: newStatus,
        meetingurl: newLink,
      });

      // Auto Update Appointment Status ตามเวลานัดหมาย
      const forcheckAppoinmentListRef = db.collection("User").doc(getUserID).collection("appointment");
      const forcheckAppoinmentList = [];

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

      let date = moment();
      for (let f = 0; f < forcheckAppoinmentList.length; f++) {
        if (forcheckAppoinmentList[f].status == "ongoing" || forcheckAppoinmentList[f].status == "done") {
          if (date.isAfter(forcheckAppoinmentList[f].appointmentEnd.toDate().toUTCString())) {
            const autoUpdateAppointment = db.collection("User").doc(getUserID).collection("appointment").doc(forcheckAppoinmentList[f].appointID.toString());
            await autoUpdateAppointment.update({
              status: "done",
            });
          }
        }
      }

      // ดึงข้อมูล appointment
      const appointmentListRef = db.collection("User").doc(getUserID).collection("appointment").orderBy("appointmentStart", "asc");
      const appointmentOngoingLists = [];
      const appointmentLists = [];

      await appointmentListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().status == "ongoing") {
            appointmentOngoingLists.push({
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
          } else if (doc.data().status == "done" || doc.data().status == "cancel") {
            appointmentLists.push({
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

      // ดึงข้อมูลมาหา line name ของ
      const headerUserListRef = db.collection("User");
      const headerUserList = [];
      await headerUserListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            headerUserList.push({
              userID: doc.data().userID,
              lineName: doc.data().lineName,
            });
          }
        });
      });

      // ดึงข้อมุล contactlist และ serach contactlist
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
              if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
                contactlists.push({
                  userID: doc.data().userID,
                  lineName: doc.data().lineName,
                });
              }
            }
          });
        });

        res.render("desktop/appointment_all", {
          contactlists,
          getAppointID,
          getUserID,
          appointmentLists,
          moment: moment,
          appointmentOngoingLists,
          headerUserList,
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

        res.render("desktop/appointment_all", {
          contactlists,
          getAppointID,
          getUserID,
          appointmentLists,
          moment: moment,
          appointmentOngoingLists,
          headerUserList,
        });
      }
    } else {
      const errorMessage = "วันเวลานัดหมายไม่ถูกต้อง ลองเลือกเวลาใหม่นะคะ";

      // ดึงข้อมูล appointment
      const appointListRef = db.collection("User").doc(getUserID).collection("appointment");
      const appointLists = [];
      await appointListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          appointLists.push({
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

      // ดึงข้อมูลมาหา line name ของ
      const headerUserListRef = db.collection("User");
      const headerUserList = [];
      await headerUserListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            headerUserList.push({
              userID: doc.data().userID,
              lineName: doc.data().lineName,
            });
          }
        });
      });

      // ดึงข้อมุล contactlist และ serach contactlist
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
              if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
                contactlists.push({
                  userID: doc.data().userID,
                  lineName: doc.data().lineName,
                });
              }
            }
          });
        });

        res.render("desktop/edit_appointment", {
          contactlists,
          getAppointID,
          getUserID,
          appointLists,
          moment: moment,
          errorMessage,
          headerUserList,
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

        res.render("desktop/edit_appointment", {
          contactlists,
          getAppointID,
          getUserID,
          appointLists,
          moment: moment,
          errorMessage,
          headerUserList,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า Appointment All หลัง แก้ Appointment
router.get("/:userID/appointment/:appointID", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;

    // Auto Update Appointment Status ตามเวลานัดหมาย
    const forcheckAppoinmentListRef = db.collection("User").doc(getUserID).collection("appointment");
    const forcheckAppoinmentList = [];

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

    let date = moment();
    for (let f = 0; f < forcheckAppoinmentList.length; f++) {
      if (forcheckAppoinmentList[f].status == "ongoing" || forcheckAppoinmentList[f].status == "done") {
        if (date.isAfter(forcheckAppoinmentList[f].appointmentEnd.toDate().toUTCString())) {
          const autoUpdateAppointment = db.collection("User").doc(getUserID).collection("appointment").doc(forcheckAppoinmentList[f].appointID.toString());
          await autoUpdateAppointment.update({
            status: "done",
          });
        }
      }
    }

    // ดึงข้อมูล appointment
    const appointmentListRef = db.collection("User").doc(getUserID).collection("appointment").orderBy("appointmentStart", "asc");
    const appointmentOngoingLists = [];
    const appointmentLists = [];

    await appointmentListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().status == "ongoing") {
          appointmentOngoingLists.push({
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
        } else if (doc.data().status == "done" || doc.data().status == "cancel") {
          appointmentLists.push({
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

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/appointment_all", {
        contactlists,
        getUserID,
        appointmentLists,
        appointmentOngoingLists,
        moment: moment,
        headerUserList,
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
      res.render("desktop/appointment_all", {
        contactlists,
        getUserID,
        appointmentLists,
        appointmentOngoingLists,
        moment: moment,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า All Note
router.get("/:userID/note", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;

    // ดึงข้อมูล Note ทั้งหมดไป show ที่หน้า All Note
    const noteListRef = db.collection("User").doc(getUserID).collection("note");
    const noteLists = [];
    await noteListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        noteLists.push({
          content: doc.data().content,
          creatorID: doc.data().creatorID,
          header: doc.data().header,
          noteID: doc.data().noteID,
        });
      });
    });

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
        headerUserList,
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

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้าเฉพาะ Note
router.get("/:userID/note/:noteID/content", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;
    const getNoteID = Number(req.params.noteID);

    // ดึงข้อมูล Note ไป show ที่หน้า Content Note
    const noteListRef = db.collection("User").doc(getUserID).collection("note");
    const noteLists = [];
    await noteListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        noteLists.push({
          content: doc.data().content,
          creatorID: doc.data().creatorID,
          header: doc.data().header,
          noteID: doc.data().noteID,
          timestamp: doc.data().timestamp,
        });
      });
    });

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
              firstName: doc.data().firstName,
              lastName: doc.data().lastName,
            });
          }
        });
      });
      let i = 0;

      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            i++;
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
                firstName: doc.data().firstName,
                lastName: doc.data().lastName,
              });
            }
          }
        });
      });

      res.render("desktop/note_content", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
        moment: moment,
        headerUserList,
      });
    } else {
      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            contactlists.push({
              userID: doc.data().userID,
              lineName: doc.data().lineName,
              firstName: doc.data().firstName,
              lastName: doc.data().lastName,
            });
          }
        });
      });

      res.render("desktop/note_content", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
        moment: moment,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้าแก้ไข Note
router.get("/:userID/note/:noteID/content/edit", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;
    const getNoteID = Number(req.params.noteID);

    // ดึงข้อมูล Note ไป show ที่หน้า Edit Note
    const noteListRef = db.collection("User").doc(getUserID).collection("note");
    const noteLists = [];
    await noteListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        noteLists.push({
          content: doc.data().content,
          creatorID: doc.data().creatorID,
          header: doc.data().header,
          noteID: doc.data().noteID,
          timestamp: doc.data().timestamp,
        });
      });
    });

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/note_edit", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
        headerUserList,
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

      res.render("desktop/note_edit", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* แก้ไขข้อมูล Note
router.post("/:userID/note/:noteID/content", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;
    const getNoteID = Number(req.params.noteID);

    // update note  ลง DB
    const checkSave = req.body.saveEdit;
    if (checkSave == "Submit") {
      const newHeader = req.body.new_header;
      const newContent = req.body.new_content;

      const updateContent = db.collection("User").doc(getUserID).collection("note").doc(getNoteID.toString());
      const res = await updateContent.update({
        content: newContent,
        header: newHeader,
        timestamp: FieldValue.serverTimestamp(),
      });
    }

    // ดึงข้อมูล Note ที่ update แล้ว ไป show ที่หน้า Content Note
    const noteListRef = db.collection("User").doc(getUserID).collection("note");
    const noteLists = [];
    await noteListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        noteLists.push({
          content: doc.data().content,
          creatorID: doc.data().creatorID,
          header: doc.data().header,
          noteID: doc.data().noteID,
          timestamp: doc.data().timestamp,
        });
      });
    });

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
              firstName: doc.data().firstName,
              lastName: doc.data().lastName,
            });
          }
        });
      });
      let i = 0;

      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            i++;
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
                firstName: doc.data().firstName,
                lastName: doc.data().lastName,
              });
            }
          }
        });
      });

      res.render("desktop/note_content", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
        moment: moment,
        headerUserList,
      });
    } else {
      await contactListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().lineName != null && doc.data().lineName != "") {
            contactlists.push({
              userID: doc.data().userID,
              lineName: doc.data().lineName,
              firstName: doc.data().firstName,
              lastName: doc.data().lastName,
            });
          }
        });
      });

      res.render("desktop/note_content", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
        moment: moment,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* ลบ Note
router.get("/:userID/note/:noteID/delete", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;
    const getNoteID = Number(req.params.noteID);

    // ลบ note ออหจาห DB
    const deleteContent = db.collection("User").doc(getUserID).collection("note").doc(getNoteID.toString());
    const response = await deleteContent.delete();

    // ดึงข้อมูล Note หลังจากลบ ไป show ที่หน้า All Note
    const noteListRef = db.collection("User").doc(getUserID).collection("note");
    const noteLists = [];
    await noteListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        noteLists.push({
          content: doc.data().content,
          creatorID: doc.data().creatorID,
          header: doc.data().header,
          noteID: doc.data().noteID,
          timestamp: doc.data().timestamp,
        });
      });
    });

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
        headerUserList,
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

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้าเพิ่ม Note
router.get("/:userID/note/add", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/note_add", {
        contactlists,
        getUserID,
        headerUserList,
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

      res.render("desktop/note_add", {
        contactlists,
        getUserID,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//* เพิ่ม Note
router.post("/:userID/note/add", async (req, res, next) => {
  try {
    const getUserID = req.params.userID;

    // รับข้อมูลมาจาก front-end
    const createContent = req.body.create_content;
    const createHeader = req.body.create_header;

    // Add Note ลง  DB
    const oldNote = [];
    const oldNoteID = await db
      .collection("User")
      .doc(getUserID)
      .collection("note")
      .orderBy("noteID", "desc")
      .limit(1)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          oldNote.push({
            content: doc.data().content,
            creatorID: doc.data().creatorID,
            header: doc.data().header,
            noteID: doc.data().noteID,
            timestamp: doc.data().timestamp,
          });
        });
      });

    if (oldNote[0] == undefined) {
      const data = {
        content: createContent,
        creatorID: getUserID,
        header: createHeader,
        noteID: 1,
        timestamp: FieldValue.serverTimestamp(),
      };

      await db.collection("User").doc(getUserID).collection("note").doc("1").set(data);
    } else if (oldNote[0] != undefined) {
      let newNoteID = Number(oldNote[0].noteID) + 1;

      const data = {
        content: createContent,
        creatorID: getUserID,
        header: createHeader,
        noteID: newNoteID,
        timestamp: FieldValue.serverTimestamp(),
      };

      await db.collection("User").doc(getUserID).collection("note").doc(newNoteID.toString()).set(data);
    }

    const noteListRef = db.collection("User").doc(getUserID).collection("note");
    const noteLists = [];
    await noteListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        noteLists.push({
          content: doc.data().content,
          creatorID: doc.data().creatorID,
          header: doc.data().header,
          noteID: doc.data().noteID,
          timestamp: doc.data().timestamp,
        });
      });
    });

    // ดึงข้อมูลมาหา line name ของ
    const headerUserListRef = db.collection("User");
    const headerUserList = [];
    await headerUserListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().lineName != null && doc.data().lineName != "") {
          headerUserList.push({
            userID: doc.data().userID,
            lineName: doc.data().lineName,
          });
        }
      });
    });

    // ดึงข้อมุล contactlist และ serach contactlist
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
            if (contactlists_temp[i - 1].lineName.toLowerCase().includes(search_name.toLowerCase())) {
              contactlists.push({
                userID: doc.data().userID,
                lineName: doc.data().lineName,
              });
            }
          }
        });
      });

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
        headerUserList,
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

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
        headerUserList,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
