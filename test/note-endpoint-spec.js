const knex = require("knex");
const app = require("../src/app");
const { makeFolderArray } = require("./folder-fixtures");
const { makeNoteArray } = require("./note-fixtures");

describe("Articles Endpoints", function() {
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
    db.raw("TRUNCATE folder, note RESTART IDENTITY CASCADE");
    console.log("before cleanup ran");
  });

  afterEach("cleanup", () => {
    db.raw("TRUNCATE folder, note RESTART IDENTITY CASCADE");
    console.log("afterEach cleanup ran");
  });
  afterEach("cleanup", () => db("note").truncate());

  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/notes")
          .expect(200, []);
      });
    });
    context("Given there are articles in the database", () => {
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
});
