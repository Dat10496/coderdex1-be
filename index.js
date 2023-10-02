var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

require("dotenv").config();
const cors = require("cors");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/", indexRouter);

app.use((req, res, next) => {
  const err = new Error("Path not found");
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res
    .status(err.statusCode ? err.statusCode : 500)
    .send(err.message ? err.message : "Internal server Error");
});

module.exports = app;
