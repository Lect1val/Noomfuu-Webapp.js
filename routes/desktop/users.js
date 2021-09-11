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

    res.render("desktop/all_note", {
      contactlists,
      getUserID,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:userID/note/content", async (req, res, next) => {
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

    res.render("desktop/note_content", {
      contactlists,
      getUserID,
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
