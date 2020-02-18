const knex = require("knex");
const app = require("../src/app");
const { makeFolderArray } = require("./folder-fixtures");
const { makeNoteArray } = require("./note-fixtures");

describe("note Endpoints", function() {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  after("cleanup", () => {
    db.raw("TRUNCATE TABLE note, folder RESTART IDENTITY CASCADE");
    console.log("after cleanup ran");
  });

  before("clean the table", () => {
    db.raw("TRUNCATE TABLE note, folder RESTART IDENTITY CASCADE");
    console.log("before cleanup ran");
  });

  afterEach("cleanup", () => {
    db.raw("TRUNCATE TABLE note, folder RESTART IDENTITY CASCADE");
    console.log("afterEach cleanup ran");
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
        console.log("beforeEach insert notes was triggered");
        return db
          .into("folder")
          .insert(testFolders)
          .then(() => {
            console.log("insert testNotes ran");
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
        console.log("beforeEach insert notes was triggered");
        return db
          .into("folder")
          .insert(testFolders)
          .then(() => {
            console.log("insert testNotes ran");
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
  describe.only(`POST /api/note`, () => {
    it(`creates an note, responding with 201 and the new note`, function() {
      this.retries(3);
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
          // const expected = new Date().toLocaleString();
          // const actual = new Date(res.body.modif).toLocaleString();
          // expect(actual).to.eql(expected);
        })
        .then(postRes =>
          supertest(app)
            .get(`/api/notes/${postRes.body.id}`)
            .expect(postRes.body)
        );
    });
  });
});
