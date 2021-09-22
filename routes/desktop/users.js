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

    res.render("desktop/user_profile", {
      contactlists,
      profileList,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/:userID", async (req, response, next) => {
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
    const res = await updateProfile.update({
      firstName: newFirstName,
      lastName: newLastName,
      TelNo: newTel,
      Email: newEmail,
      contactNote: newContactNote,
    });

    console.log(newFirstName);
    console.log(newLastName);
    console.log(newTel);
    console.log(newEmail);
    console.log(newContactNote);

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

    response.redirect("/profile/" + getUserID);
    // res.render("desktop/user_profile", {
    //   contactlists,
    //   profileList,
    //   getUserID,
    // });
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
        if (doc.data().nickName != null && doc.data().nickName != "") {
          contactlists.push({
            userID: doc.data().userID,
            nickName: doc.data().nickName,
          });
        }
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

module.exports = router;
