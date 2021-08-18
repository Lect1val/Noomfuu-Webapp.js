var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// *Route Desktop*
var indexRouter = require("./routes/desktop/index");
var usersRouter = require("./routes/desktop/users");
var analyticRouter = require("./routes/desktop/feeling_analytic");
var noteRouter = require("./routes/desktop/note");
var noteContentRouter = require("./routes/desktop/note_content");
var noteEditRouter = require("./routes/desktop/note_edit");
var appointmentRouter = require("./routes/desktop/appointment_all");
// var contactList = require("./routes/contactlist");

// *Route Mobile*
var assessment2QRouter = require("./routes/mobile/assessment2Q");
var assessment9QRouter = require("./routes/mobile/assessment9Q");

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
app.use("/profile", usersRouter);
app.use("/profile/analytic", analyticRouter);
app.use("/profile/note", noteRouter);
app.use("/profile/note/content", noteContentRouter);
app.use("/profile/note/content/edit", noteEditRouter);
app.use("/profile/appointment", appointmentRouter);
// app.use(contactList);

// *App.use Mobile*
app.use("/assessment/2Q", assessment2QRouter);
app.use("/assessment/9Q", assessment9QRouter);

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
