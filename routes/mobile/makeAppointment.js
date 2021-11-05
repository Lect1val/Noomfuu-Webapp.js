var express = require("express");
var router = express.Router();
const { db } = require("../../Database/database");
//const { calendar } = require("../../controller/calendar");

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPE = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const client_id = "856329999838-indv4mv7k2oa39iatapono29kj4l5c6m.apps.googleusercontent.com"
const project_id = "noomfuu-jfge"
const auth_uri = "https://accounts.google.com/o/oauth2/auth"
const token_uri = "https://oauth2.googleapis.com/token"
const auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
const client_secret = "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"
const javascript_origins = ["https://noomfuu-webapp-js.herokuapp.com"]

function authorize(credentials, callback) {
  client_secret, client_id, redirect_uris = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

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
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
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
  res.render("mobile/appointDetail", {userID});

});

router.post("/add", async (req, res, next)=> {
  const userID = req.query.id;
  console.log(userID);
  const appointStdID = req.body.appointStdID;
  const appointName = req.body.appointName;
  const appointDate = req.body.appointDate;
  const appointTime = req.body.appointTime + ":00+0700Z";
  const type = req.body.type;

  const appointStart = new Date(appointDate + " " + appointTime)
  const appointEnd = new Date(new Date(appointStart).setHours(appointStart.getHours() + 1));

  console.log(appointStart, appointEnd)

  const data = {
    // appointID: ,
    userID: userID,
    studentID: appointStdID,
    fullname: appointName,
    appointmentStart: appointStart,
    appointmentEnd: appointEnd,
    type: type,
    timestamp: FieldValue.serverTimestamp(),
  };



  res.render("mobile/appointDetail", {userID});

});

router.get("/googleAdd", (req, res, next) => {

  var event = {
    'summary': 'Google I/O 2015',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': '2021-10-28T09:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'end': {
      'dateTime': '2021-10-28T17:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [
      {'email': 'srud8mm07ss8rkfs04kkcj3oac@group.calendar.google.com'},
    ],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10},
      ],
    },
  };

  console.log("create var")
  
  const calendar = google.calendar({version:"v3", auth})
  calendar.events.insert({
    auth: auth,
    calendarId: 'primary',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.htmlLink);
  });

  res.redirect("/appointment");
})

module.exports = router;
