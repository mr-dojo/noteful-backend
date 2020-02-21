const knex = require("knex");
const app = require("../src/app");
const { makeFolderArray, makeFolderArrayNoId } = require("./folder-fixtures");
const { makeNoteArray } = require("./note-fixtures");

describe("note Endpoints", function() {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => {
    return Promise.all([
      db.raw(`truncate table folder restart identity cascade`),
      db.raw(`truncate table note restart identity cascade`)
    ]);
  });

  afterEach("cleanup", () => {
    return Promise.all([
      db.raw(`truncate table folder restart identity cascade`),
      db.raw(`truncate table note restart identity cascade`)
    ]);
  });

  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/notes")
          .expect(200, []);
      });
    });
    context("Given there are notes in the database", () => {
      const testFolders = makeFolderArray();
      const testNotes = makeNoteArray();

      beforeEach("insert notes", () => {
        return db
          .into("folder")
          .insert(testFolders)
          .then(() => {
            return db.into("note").insert(testNotes);
          });
      });

      it("GET /api/notes responds with 200 and all of the notes", () => {
        return supertest(app)
          .get("/api/notes")
          .expect(200, testNotes);
      });
    });
  });
  describe(`GET /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456;
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `note doesn't exist` } });
      });
    });
    context("Given there are notes in the database", () => {
      const testFolders = makeFolderArray();
      const testNotes = makeNoteArray();

      beforeEach("insert notes", () => {
        return db
          .into("folder")
          .insert(testFolders)
          .then(() => {
            return db.into("note").insert(testNotes);
          });
      });
      it("GET /api/note/:note_id responds with 200 and the specified note", () => {
        const noteId = 2;
        const expectedNote = testNotes[noteId - 1];
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote);
      });
    });
  });
  describe(`POST /api/notes`, () => {
    const testFoldersNoId = makeFolderArrayNoId();

    beforeEach("insert folders", () => {
      return db.into("folder").insert(testFoldersNoId);
    });

    it(`creates an note, responding with 201 and the new note`, function() {
      const newNote = {
        name: "New Test",
        folder_id: 3,
        content: "This is test content"
      };
      return supertest(app)
        .post("/api/notes")
        .send(newNote)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newNote.name);
          expect(res.body.folder_id).to.eql(newNote.folder_id);
          expect(res.body.content).to.eql(newNote.content);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
          const expected = new Date().toLocaleString();
          const actual = new Date(res.body.modified).toLocaleString();
          expect(actual).to.eql(expected);
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/notes/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
    const requiredFields = ["name", "content", "folder_id"];

    requiredFields.forEach(field => {
      const newNote = {
        name: "Updated note",
        content: "Example updated content",
        folder_id: 2
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newNote[field];

        return supertest(app)
          .post("/api/notes")
          .send(newNote)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });
  });
  describe(`PATCH /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456;
        return supertest(app)
          .patch(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `note doesn't exist` } });
      });
    });
    context("Given there are notes in the database", () => {
      const testNotes = makeNoteArray();
      const testFolders = makeFolderArray();

      beforeEach("insert notes", () => {
        return db
          .into("folder")
          .insert(testFolders)
          .then(() => {
            return db.into("note").insert(testNotes);
          });
      });
      it("responds with 204 and updates the note", () => {
        const idToUpdate = 2;
        const updateNote = {
          name: "updated note name",
          folder_id: 2,
          content: "updated note content"
        };
        const expectedNote = {
          ...testNotes[idToUpdate - 1],
          ...updateNote
        };
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .send(updateNote)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)
              .expect(expectedNote)
          );
      });
    });
  });
  describe(`DELETE /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456;
        return supertest(app)
          .delete(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `note doesn't exist` } });
      });
    });
    context("Given there are notes in the database", () => {
      const testNotes = makeNoteArray();
      const testFolders = makeFolderArray();

      beforeEach("insert notes", () => {
        return db
          .into("folder")
          .insert(testFolders)
          .then(() => {
            return db.into("note").insert(testNotes);
          });
      });

      it("responds with 204 and removes the note", () => {
        const idToRemove = 2;
        const expectedNotes = testNotes.filter(note => note.id !== idToRemove);
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes`)
              .expect(expectedNotes)
          );
      });
    });
  });
});
