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
//_________NEXT___________ .post endpoint

noteRouter
  .route("/notes/:note_id")
  .all((req, res, next) => {
    NoteService.getById(req.app.get("db"), req.params.note_id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `note doesn't exist` }
          });
        }
        res.note = note; // save the note for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req, res, next) => res.status(200).json(res.note));

module.exports = noteRouter;
