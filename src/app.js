require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { NODE_ENV } = require("./config");
const logger = require("./logger"); // TODO
// const helmet = require("helmet"); // TODO
//const noteRouter = require("./note/noteRouter") // TODO
//const folderRouter = require("./folder/folderRouter") // TODO

const app = express();
const morganSetting = NODE_ENV === "production" ? "tiny" : "dev";

app.use(morgan(morganSetting));
app.use(cors());
//app.use(helmet()); // TODO
//app.use(validateBearerToken); // TODO
//app.use("/api", noteRouter, folderRouter); // TODO

// ___________ADD VALIDATION__________

app.get("/", (req, res, next) => {
  logger.info(`Accessed root and got "Hello Noteful!"`);
  res.send(200, "Hello Noteful!");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "Server error" } };
  } else {
    response = { error: { message: error.message, error } };
  }
  res.status(500).json(response);
});

module.exports = app;
