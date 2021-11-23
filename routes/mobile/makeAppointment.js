var express = require("express");
var router = express.Router();
const { db, FieldValue } = require("../../Database/database");
var moment = require("moment");
//const { calendar } = require("../../controller/calendar");

const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPE = ["https://www.googleapis.com/auth/calendar"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

const client_id = "856329999838-indv4mv7k2oa39iatapono29kj4l5c6m.apps.googleusercontent.com";
const project_id = "noomfuu-jfge";
const auth_uri = "https://accounts.google.com/o/oauth2/auth";
const token_uri = "https://oauth2.googleapis.com/token";
const auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs";
const client_secret = "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";
const javascript_origins = ["https://noomfuu-webapp-js.herokuapp.com"];

function authorize(credentials, callback) {
  client_secret, client_id, (redirect_uris = credentials.installed);
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

router.get("/", (req, res, next) => {
  res.render("mobile/makeAppointment");
});

router.get("/add", (req, res, next) => {
  const userID = req.query.id;
  res.render("mobile/appointDetail", { userID });
});

router.post("/add", async (req, res, next) => {
  const userID = req.query.id;

  const appointStdID = req.body.appointStdID;
  const appointName = req.body.appointName;
  const appointDate = req.body.appointDate;
  const appointTime = req.body.appointTime + ":0000";
  const type = req.body.type;

  const appointStart = new Date(appointDate + " " + appointTime);
  const appointEnd = new Date(new Date(appointStart).setHours(appointStart.getHours() + 1));
  if (Date.parse(appointStart) < Date.now()) {
    console.log(appointStart, appointEnd);

    const oldAppointment = [];
    const oldAppointmentID = await db
      .collection("User")
      .doc(userID)
      .collection("appointment")
      .orderBy("appointID", "desc")
      .limit(1)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          oldAppointment.push({
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

    if (oldAppointment[0] == undefined) {
      const data = {
        appointID: 1,
        userID: userID,
        studentID: appointStdID,
        fullname: appointName,
        appointmentStart: moment(appointStart),
        appointmentEnd: moment(appointEnd),
        type: type,
        timestamp: FieldValue.serverTimestamp(),
        status: "ongoing",
        meetingurl: "",
      };

      await db.collection("User").doc(userID).collection("appointment").doc("1").set(data);
    } else if (oldAppointment[0] != undefined) {
      const newAppointmentID = Number(oldAppointment[0].appointID) + 1;
      const data = {
        appointID: newAppointmentID,
        userID: userID,
        studentID: appointStdID,
        fullname: appointName,
        appointmentStart: moment(appointStart),
        appointmentEnd: moment(appointEnd),
        type: type,
        timestamp: FieldValue.serverTimestamp(),
        status: "ongoing",
        meetingurl: "",
      };

      await db.collection("User").doc(userID).collection("appointment").doc(newAppointmentID.toString()).set(data);
    }

    res.render("mobile/assessmentDASSwarning", { userID });
  }
  res.render("mobile/assessmentDASSwarning", { userID });
});

module.exports = router;
