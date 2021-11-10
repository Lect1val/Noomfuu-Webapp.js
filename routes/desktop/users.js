var express = require("express");
var router = express.Router();
const { db, FieldValue } = require("../../Database/database");

/* GET users listing. */
// router.get("/", function (req, res, next) {
//   res.render("user_profile", { title: "Express" });
// });

router.get("/", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];

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

    const profileListRef = db.collection("User");
    const profileList = [];
    const getUserID = "6";
    // let testReq = req.params.userID;
    // console.log(testReq);
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

    res.render("desktop/user_profile", {
      contactlists,
      profileList,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า User Profile
router.get("/:userID", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];

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

    const profileListRef = db.collection("User");
    const profileList = [];
    const getUserID = req.params.userID;

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

    res.render("desktop/user_profile", {
      contactlists,
      profileList,
      getUserID,
      emotionList,
      timeList,
      chartList,
    });
  } catch (error) {
    console.log(error);
  }
});

//* แก้ไขข้อมูลในหน้า User Profile
router.post("/:userID", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];

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
    const getUserID = req.params.userID;
    const newFirstName = req.body.new_firstName;
    const newLastName = req.body.new_lastName;
    const newTel = req.body.new_tel;
    const newEmail = req.body.new_email;
    const newContactNote = req.body.new_contactNote;

    const updateProfile = db.collection("User").doc(getUserID);
    const response = await updateProfile.update({
      firstName: newFirstName,
      lastName: newLastName,
      TelNo: newTel,
      Email: newEmail,
      contactNote: newContactNote,
    });

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

    res.redirect("/profile/" + getUserID);
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า Analytic
router.get("/:userID/analytic", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
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

    res.render("desktop/feeling_analytic", {
      contactlists,
      getUserID,
      assessmentList,
      chatList,
      chartList,
      timeList,
      emotionList,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า ALl Assessment
router.get("/:userID/assessment", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;

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

    const assessmentListRef = await db
      .collection("User")
      .doc(getUserID)
      .collection("assessment")
      .orderBy("timestamp", "desc");

    const search_name = req.query.search;
    const filter = req.query.filter;
    const assessmentList_temp = [];
    const assessmentList = [];

    if (search_name != null && filter != null) {
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
              assessmentList_temp[i].status.toLowerCase() == search_name
            );
            i++;
            if (
              assessmentList_temp[i - 1].status.toLowerCase() == search_name
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
        if (search_name == "dass") {
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
        } else if (search_name == "depress" || "ซึมเศร้า") {
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
    console.log(assessmentList);
    res.render("desktop/all_assessment", {
      contactlists,
      getUserID,
      assessmentList,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า All Chat History
router.get("/:userID/chat", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;

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

    const chatListRef = await db
      .collection("User")
      .doc(getUserID)
      .collection("message")
      .orderBy("timestamp", "desc");

    const search_name = req.query.search;
    const filter = req.query.filter;
    const chatList_temp = [];
    const chatList = [];

    if (search_name != null && filter != null) {
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
                .includes(search_name.toLowerCase())
            );
            i++;
            if (
              chatList_temp[i - 1].content
                .toLowerCase()
                .includes(search_name.toLowerCase())
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
        if (search_name.includes("neg")) {
          emotion = "-1";
        } else if (search_name.includes("pos")) {
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

    res.render("desktop/all_chat", {
      contactlists,
      getUserID,
      chatList,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า Appointment
router.get("/:userID/appointment", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
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

    res.render("desktop/appointment_all", {
      contactlists,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้า All Note
router.get("/:userID/note", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
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

    res.render("desktop/all_note", {
      contactlists,
      noteLists,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้าเฉพาะ Note
router.get("/:userID/note/:noteID/content", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    const getNoteID = req.params.noteID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().nickName != null && doc.data().nickName != "") {
          contactlists.push({
            userID: doc.data().userID,
            nickName: doc.data().nickName,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
          });
        }
      });
    });

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
    // console.log(contactlists);
    // console.log(noteLists);

    res.render("desktop/note_content", {
      contactlists,
      noteLists,
      getUserID,
      getNoteID,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้าแก้ไข Note
router.get("/:userID/note/:noteID/content/edit", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    const getNoteID = req.params.noteID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().nickName != null && doc.data().nickName != "") {
          contactlists.push({
            userID: doc.data().userID,
            nickName: doc.data().nickName,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
          });
        }
      });
    });

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

    res.render("desktop/note_edit", {
      contactlists,
      noteLists,
      getUserID,
      getNoteID,
    });
  } catch (error) {
    console.log(error);
  }
});

//* แก้ไขข้อมูล Note
router.post("/:userID/note/:noteID/content", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    const getNoteID = req.params.noteID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().nickName != null && doc.data().nickName != "") {
          contactlists.push({
            userID: doc.data().userID,
            nickName: doc.data().nickName,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
          });
        }
      });
    });

    const checkSave = req.body.saveEdit;
    // console.log(checkSave);
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

    res.render("desktop/note_content", {
      contactlists,
      noteLists,
      getUserID,
      getNoteID,
    });
  } catch (error) {
    console.log(error);
  }
});

//* ลบ Note
router.get("/:userID/note/:noteID/delete", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    const getNoteID = req.params.noteID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().nickName != null && doc.data().nickName != "") {
          contactlists.push({
            userID: doc.data().userID,
            nickName: doc.data().nickName,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
          });
        }
      });
    });

    const deleteContent = db
      .collection("User")
      .doc(getUserID)
      .collection("note")
      .doc(getNoteID);
    const response = await deleteContent.delete();

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

    res.render("desktop/all_note", {
      contactlists,
      noteLists,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เข้าหน้าเพิ่ม Note
router.get("/:userID/note/add", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;

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

    res.render("desktop/note_add", {
      contactlists,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

//* เพิ่ม Note
router.post("/:userID/note/add", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;

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

    const createContent = req.body.create_content;
    const createHeader = req.body.create_header;

    // const oldNoteID = await db
    //   .collection("User")
    //   .doc(getUserID)
    //   .collection("note")
    //   .get()
    //   .then((snapshot) => snapshot.size);
    // let newNoteID = (oldNoteID + 1).toString();

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

    res.render("desktop/all_note", {
      contactlists,
      noteLists,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
