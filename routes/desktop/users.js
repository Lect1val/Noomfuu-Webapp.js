var express = require("express");
var router = express.Router();
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
    const chartListRef = await db
      .collection("User")
      .doc(getUserID)
      .collection("message")
      .orderBy("timestamp", "asc");
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
        if (
          chartList[L - 1].timestamp.toDate().toDateString() !=
          chartList[L].timestamp.toDate().toDateString()
        ) {
          countIndexList++;
          timeList[countIndexList] = chartList[L];
          scoreEmotion = Number(chartList[L].emotion);
          emotionList[countIndexList] = scoreEmotion;
        } else if (
          chartList[L - 1].timestamp.toDate().toDateString() ==
          chartList[L].timestamp.toDate().toDateString()
        ) {
          scoreEmotion = scoreEmotion + Number(chartList[L].emotion);
          emotionList[countIndexList] = scoreEmotion;
        }
      }
    }

    //ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/user_profile", {
        contactlists,
        profileList,
        getUserID,
        emotionList,
        timeList,
        chartList,
        urlPic,
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
        if (doc.data().userID == getUserID) {
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

    //ดึงข้อมุล contactlist และ serach contactlist
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
    const assessmentListRef = await db
      .collection("User")
      .doc(getUserID)
      .collection("assessment")
      .orderBy("timestamp", "desc")
      .limit(3);
    const assessmentList = [];

    await assessmentListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().type == "dass") {
          console.log("dass");
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
          console.log("depress");
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
    const chartListRef = await db
      .collection("User")
      .doc(getUserID)
      .collection("message")
      .orderBy("timestamp", "asc");
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
        if (
          chartList[L - 1].timestamp.toDate().toDateString() !=
          chartList[L].timestamp.toDate().toDateString()
        ) {
          countIndexList++;
          timeList[countIndexList] = chartList[L];
          scoreEmotion = Number(chartList[L].emotion);
          emotionList[countIndexList] = scoreEmotion;
        } else if (
          chartList[L - 1].timestamp.toDate().toDateString() ==
          chartList[L].timestamp.toDate().toDateString()
        ) {
          scoreEmotion = scoreEmotion + Number(chartList[L].emotion);
          emotionList[countIndexList] = scoreEmotion;
        }
      }
    }

    // ดึงข้อมูล chat 3 อันดับล่าสุด ไป show ในหน้า Analytic
    const chatListRef = await db
      .collection("User")
      .doc(getUserID)
      .collection("message")
      .orderBy("timestamp", "desc")
      .limit(3);
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

    //ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/feeling_analytic", {
        contactlists,
        getUserID,
        assessmentList,
        chatList,
        chartList,
        timeList,
        emotionList,
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
    const assessmentListRef = await db
      .collection("User")
      .doc(getUserID)
      .collection("assessment")
      .orderBy("timestamp", "desc");

    const search_assessment_name = req.query.searchassessment;
    const filter = req.query.filter;
    const assessmentList_temp = [];
    const assessmentList = [];

    if (search_assessment_name != null && filter != null) {
      if (filter == "state") {
        await assessmentListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            if (doc.data().type == "dass") {
              console.log("dass");
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
              console.log("depress");
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

        let i = 0;

        await assessmentListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            console.log(assessmentList_temp[i].status.toLowerCase());
            console.log(
              assessmentList_temp[i].status.toLowerCase() ==
                search_assessment_name
            );
            i++;
            if (
              assessmentList_temp[i - 1].status.toLowerCase() ==
              search_assessment_name
            ) {
              if (doc.data().type == "dass") {
                console.log("dass");
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
                console.log("depress");
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
        if (search_assessment_name == "dass") {
          await assessmentListRef.get().then((snapshot) => {
            snapshot.forEach((doc) => {
              if (doc.data().type == "dass") {
                console.log("dass");
                assessmentList.push({
                  assessmentID: doc.data().assessmentID,
                  type: doc.data().type,
                  timestamp: doc.data().timestamp,
                  status: doc.data().status,
                  Ascore: doc.data().Ascore,
                  Dscore: doc.data().Dscore,
                  Sscore: doc.data().Sscore,
                });
              }
            });
          });
        } else if (search_assessment_name == "depress" || "ซึมเศร้า") {
          await assessmentListRef.get().then((snapshot) => {
            snapshot.forEach((doc) => {
              if (doc.data().type == "depress") {
                console.log("depress");
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
      }
    } else {
      await assessmentListRef.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().type == "dass") {
            console.log("dass");
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
            console.log("depress");
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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/all_assessment", {
        contactlists,
        getUserID,
        assessmentList,
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
    const chatListRef = await db
      .collection("User")
      .doc(getUserID)
      .collection("message")
      .orderBy("timestamp", "desc");

    const search_chat_name = req.query.searchchat;
    const filter = req.query.filter;
    const chatList_temp = [];
    const chatList = [];

    if (search_chat_name != null && filter != null) {
      if (filter == "chat") {
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
        let i = 0;

        await chatListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            console.log(chatList_temp[i].content.toLowerCase());
            console.log(
              chatList_temp[i].content
                .toLowerCase()
                .includes(search_chat_name.toLowerCase())
            );
            i++;
            if (
              chatList_temp[i - 1].content
                .toLowerCase()
                .includes(search_chat_name.toLowerCase())
            ) {
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
        let emotion = "";
        if (search_chat_name.includes("neg")) {
          emotion = "-1";
        } else if (search_chat_name.includes("pos")) {
          emotion = "1";
        } else {
          emotion = "0";
        }
        console.log(emotion);
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
        let i = 0;

        await chatListRef.get().then((snapshot) => {
          snapshot.forEach((doc) => {
            console.log(chatList_temp[i].emotion.toLowerCase());
            console.log(chatList_temp[i].emotion.toLowerCase() == emotion);
            i++;
            if (
              chatList_temp[i - 1].emotion.toLowerCase().toLowerCase() ==
              emotion
            ) {
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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/all_chat", {
        contactlists,
        getUserID,
        chatList,
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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/appointment_all", {
        contactlists,
        getUserID,
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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
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
    const getNoteID = req.params.noteID;

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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/note_content", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
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

      res.render("desktop/note_content", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
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
    const getNoteID = req.params.noteID;

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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/note_edit", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
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
    const getNoteID = req.params.noteID;

    // update note  ลง DB
    const checkSave = req.body.saveEdit;
    if (checkSave == "Submit") {
      const newHeader = req.body.new_header;
      const newContent = req.body.new_content;

      const updateContent = db
        .collection("User")
        .doc(getUserID)
        .collection("note")
        .doc(getNoteID);
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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/note_content", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
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

      res.render("desktop/note_content", {
        contactlists,
        noteLists,
        getUserID,
        getNoteID,
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
    const getNoteID = req.params.noteID;

    // ลบ note ออหจาห DB
    const deleteContent = db
      .collection("User")
      .doc(getUserID)
      .collection("note")
      .doc(getNoteID);
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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/note_add", {
        contactlists,
        getUserID,
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
        noteID: "1",
        timestamp: FieldValue.serverTimestamp(),
      };

      await db
        .collection("User")
        .doc(getUserID)
        .collection("note")
        .doc("1")
        .set(data);
    } else if (oldNote[0] != undefined) {
      const newNoteID = (Number(oldNote[0].noteID) + 1).toString();

      const data = {
        content: createContent,
        creatorID: getUserID,
        header: createHeader,
        noteID: newNoteID,
        timestamp: FieldValue.serverTimestamp(),
      };

      await db
        .collection("User")
        .doc(getUserID)
        .collection("note")
        .doc(newNoteID)
        .set(data);
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

    // ดึงข้อมุล contactlist และ serach contactlist
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

      res.render("desktop/all_note", {
        contactlists,
        noteLists,
        getUserID,
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
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
