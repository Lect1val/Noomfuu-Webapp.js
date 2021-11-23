var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// *Route Desktop*
var indexRouter = require("./routes/desktop/index");
var usersRouter = require("./routes/desktop/users");

// *Route Mobile*
var assessment2QRouter = require("./routes/mobile/assessment2Q");
var assessment9QRouter = require("./routes/mobile/assessment9Q");
var assessmentWarningRouter = require("./routes/mobile/warning");
var assessmentResultRouter = require("./routes/mobile/assessmentResult");
var DASSwarningRouter = require("./routes/mobile/DASSwarning");
var DASSQuestionRouter = require("./routes/mobile/DASSQ");
var DASSResultRouter = require("./routes/mobile/DASSresult");
var journalRouter = require("./routes/mobile/journal");
var makeAppointmentRouter = require("./routes/mobile/makeAppointment");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// *App.use Desktop*
app.use("/", indexRouter);
app.use("/home", indexRouter);
app.use("/profile", usersRouter);

// *App.use Mobile*
app.use("/assessment/depress", assessmentWarningRouter);
app.use("/assessment/depress/2Q", assessment2QRouter);
app.use("/assessment/depress/9Q", assessment9QRouter);
app.use("/assessment/depress/Qresult", assessmentResultRouter);
app.use("/assessment/dass", DASSwarningRouter);
app.use("/assessment/dass/q", DASSQuestionRouter);
app.use("/assessment/dass/result", DASSResultRouter);
app.use("/journal", journalRouter);
app.use("/appointment", makeAppointmentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
