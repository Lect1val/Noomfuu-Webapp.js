var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");

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
        contactlists.push({
          userID: doc.data().userID,
          nickName: doc.data().nickName,
        });
      });
    });

    const profileListRef = db.collection("User");
    const profileList = [];
    const getUserID = "6";
    let testReq = req.params.userID;
    console.log(testReq);
    await profileListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().userID == getUserID) {
          profileList.push({
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

router.get("/:userID", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];

    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          userID: doc.data().userID,
          nickName: doc.data().nickName,
        });
      });
    });

    const profileListRef = db.collection("User");
    const profileList = [];
    const getUserID = req.params.userID;
    let testReq = req.params.userID;
    console.log(testReq);
    await profileListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.data().userID == getUserID) {
          profileList.push({
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
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:userID/analytic", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          userID: doc.data().userID,
          nickName: doc.data().nickName,
        });
      });
    });

    res.render("desktop/feeling_analytic", {
      contactlists,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:userID/appointment", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          userID: doc.data().userID,
          nickName: doc.data().nickName,
        });
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

router.get("/:userID/note", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          userID: doc.data().userID,
          nickName: doc.data().nickName,
        });
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

router.get("/:userID/note/:noteID/content", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    const getNoteID = req.params.noteID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          userID: doc.data().userID,
          nickName: doc.data().nickName,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
        });
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
    console.log(contactlists);
    console.log(noteLists);

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

router.get("/:userID/note/content/edit", async (req, res, next) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];
    const getUserID = req.params.userID;
    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          userID: doc.data().userID,
          nickName: doc.data().nickName,
        });
      });
    });

    res.render("desktop/note_edit", {
      contactlists,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
