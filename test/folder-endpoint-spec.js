const knex = require("knex");
const app = require("../src/app");
const { makeFolderArray } = require("./folder-fixtures");
// const { makeNoteArray } = require("./note-fixtures"); // Don't need this.. right?

describe("folders Endpoints", function() {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => {
    db.raw("TRUNCATE TABLE folder RESTART IDENTITY CASCADE");
  });

  afterEach("cleanup", () => {
    db.raw("TRUNCATE TABLE folder RESTART IDENTITY CASCADE");
  });

  describe(`GET /api/folders`, () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/folders")
          .expect(200, []);
      });
    });
    context("Given there are folders in the database", () => {
      const testFolders = makeFolderArray();

      beforeEach("insert folders", () => {
        return db.into("folder").insert(testFolders);
      });

      it("GET /api/folders responds with 200 and all of the folders", () => {
        return supertest(app)
          .get("/api/folders")
          .expect(200, testFolders);
      });
    });
  });
  describe(`GET /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456;
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `folder doesn't exist` } });
      });
    });
    context("Given there are folders in the database", () => {
      const testFolders = makeFolderArray();

      beforeEach("insert folders", () => {
        return db.into("folder").insert(testFolders);
      });

      it("GET /api/folders/:folder_id responds with 200 and the specified folder", () => {
        const folderId = 2;
        const expectedFolder = testFolders[folderId - 1];
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200)
          .then(res => {
            expect(res.body.name).to.eql(expectedFolder.name);
          });
      });
    });
  });
  describe.only(`POST /api/notes`, () => {
    const testFolders = makeFolderArray();

    beforeEach("insert folders", () => {
      return db.into("folder").insert(testFolders);
    });

    it(`creates an folder, responding with 201 and the new folder`, function() {
      const newFolder = {
        name: "New Test",
        folder_id: 3,
        content: "This is test content"
      };
      return supertest(app)
        .post("/api/folders")
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name);
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/folders/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
    // const requiredFields = ["name", "content", "folder_id"];

    // requiredFields.forEach(field => {
    //   const newNote = {
    //     name: "Updated note",
    //     content: "Example updated content",
    //     folder_id: 2
    //   };

    // it(`responds with 400 and an error message when the '${field}' is missing`, () => {
    //   delete newNote[field];

    //   return supertest(app)
    //     .post("/api/notes")
    //     .send(newNote)
    //     .expect(400, {
    //       error: { message: `Missing '${field}' in request body` }
    //     });
    // });
  });
});
//   describe(`PATCH /api/notes/:note_id`, () => {
//     context(`Given no notes`, () => {
//       it(`responds with 404`, () => {
//         const noteId = 123456;
//         return supertest(app)
//           .patch(`/api/notes/${noteId}`)
//           .expect(404, { error: { message: `note doesn't exist` } });
//       });
//     });
//     context("Given there are notes in the database", () => {
//       const testNotes = makeNoteArray();
//       const testFolders = makeFolderArray();

//       beforeEach("insert notes", () => {
//         return db
//           .into("folder")
//           .insert(testFolders)
//           .then(() => {
//             return db.into("note").insert(testNotes);
//           });
//       });
//       it("responds with 204 and updates the note", () => {
//         const idToUpdate = 2;
//         const updateNote = {
//           name: "updated note name",
//           folder_id: 2,
//           content: "updated note content"
//         };
//         const expectedNote = {
//           ...testNotes[idToUpdate - 1],
//           ...updateNote
//         };
//         return supertest(app)
//           .patch(`/api/notes/${idToUpdate}`)
//           .send(updateNote)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/notes/${idToUpdate}`)
//               .expect(expectedNote)
//           );
//       });
//     });
//   });
//   describe(`DELETE /api/notes/:note_id`, () => {
//     context(`Given no notes`, () => {
//       it(`responds with 404`, () => {
//         const noteId = 123456;
//         return supertest(app)
//           .delete(`/api/notes/${noteId}`)
//           .expect(404, { error: { message: `note doesn't exist` } });
//       });
//     });
//     context("Given there are notes in the database", () => {
//       const testNotes = makeNoteArray();
//       const testFolders = makeFolderArray();

//       beforeEach("insert notes", () => {
//         return db
//           .into("folder")
//           .insert(testFolders)
//           .then(() => {
//             return db.into("note").insert(testNotes);
//           });
//       });

//       it("responds with 204 and removes the note", () => {
//         const idToRemove = 2;
//         const expectedNotes = testNotes.filter(note => note.id !== idToRemove);
//         return supertest(app)
//           .delete(`/api/notes/${idToRemove}`)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/notes`)
//               .expect(expectedNotes)
//           );
//       });
//     });
//   });
