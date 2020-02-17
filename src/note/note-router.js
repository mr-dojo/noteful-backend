const express = require("express");
const NoteService = require("./note-service");
// const xss = require("xss");

const noteRouter = express.Router();
const jsonParser = express.json();

// const serializeArticle = article => ({ _______Impliment XSS____
//   id: article.id,
//   style: article.style,
//   title: xss(article.title),
//   content: xss(article.content),
//   date_published: article.date_published,
//   author: article.author
// });

noteRouter.route("/notes").get((req, res, next) => {
  NoteService.getAllNotes(req.app.get("db"))
    .then(note => {
      // res.json(note.map(serializeArticle))
      res.json(note);
    })
    .catch(next);
});

module.exports = noteRouter;
