const path = require("path");
const express = require("express");
const FolderService = require("./folder-service");
const xss = require("xss");

const folderRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
  name: xss(folder.name)
});

folderRouter.route("/").get((req, res, next) => {
  FolderService.getAllFolders(req.app.get("db"))
    .then(folder => {
      res.json(folder.map(serializeFolder));
    })
    .catch(next);
});
//   .post(jsonParser, (req, res, next) => {
//     const { name, content, folder_id } = req.body;
//     const newNote = { name, content, folder_id };

//     for (const [key, value] of Object.entries(newNote)) {
//       if (value == null) {
//         return res.status(400).json({
//           error: { message: `Missing '${key}' in request body` }
//         });
//       }
//     }
//     NoteService.insertNote(req.app.get("db"), newNote)
//       .then(note => {
//         res
//           .status(201)
//           .location(path.posix.join(req.originalUrl, `/${note.id}`))
//           .json(serializeNote(note));
//       })
//       .catch(next);
//   });

// noteRouter
//   .route("/:note_id")
//   .all((req, res, next) => {
//     NoteService.getById(req.app.get("db"), req.params.note_id)
//       .then(note => {
//         if (!note) {
//           return res.status(404).json({
//             error: { message: `note doesn't exist` }
//           });
//         }
//         res.note = note; // save the note for the next middleware
//         next(); // don't forget to call next so the next middleware happens!
//       })
//       .catch(next);
//   })
//   .get((req, res, next) => res.status(200).json(res.note))
//   .patch(jsonParser, (req, res, next) => {
//     const { name, content, folder_id } = req.body;
//     const noteToUpdate = { name, content, folder_id };

//     const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
//     if (numberOfValues === 0) {
//       return res.status(400).json({
//         error: {
//           message: `Request body must contain either "name", "folder_id", or "content"`
//         }
//       });
//     }

//     NoteService.updateNote(req.app.get("db"), req.params.note_id, noteToUpdate)
//       .then(numRowsAffected => {
//         res.status(204).end();
//       })
//       .catch(next);
//   })
//   .delete((req, res, next) => {
//     const knexInstance = req.app.get("db");
//     NoteService.deleteNote(knexInstance, req.params.note_id)
//       .then(numRowsAffected => {
//         res.status(204).end();
//       })
//       .catch(next);
//   });

module.exports = folderRouter;
