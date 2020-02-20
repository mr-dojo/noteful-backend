const knex = require("knex");
const app = require("../src/app");
const { makeFolderArray } = require("./folder-fixtures");

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
    return Promise.all([
      db.raw(`truncate table folder restart identity cascade`)
    ]);
  });

  afterEach("cleanup", () => {
    return Promise.all([
      db.raw(`truncate table folder restart identity cascade`)
    ]);
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
  describe(`POST /api/folders`, () => {
    it(`creates an folder, responding with 201 and the new folder`, function() {
      const newFolder = {
        name: "New Test"
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
    const requiredFields = ["name"];

    requiredFields.forEach(field => {
      const newFolder = {
        name: "Updated Folder"
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field];

        return supertest(app)
          .post("/api/folders")
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });
  });
  describe(`PATCH /apiFolders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456;
        return supertest(app)
          .patch(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `folder doesn't exist` } });
      });
    });
    context("Given there are folders in the database", () => {
      const testFolders = makeFolderArray();

      beforeEach("insert folders", () => {
        return db.into("folder").insert(testFolders);
      });

      it("responds with 204 and updates the folder", () => {
        const idToUpdate = 2;
        const updateFolder = {
          name: "updated folder name"
        };
        const expectedFolder = {
          id: idToUpdate,
          ...testFolders[idToUpdate - 1],
          ...updateFolder
        };
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send(updateFolder)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expectedFolder)
          );
      });
    });
  });
  describe(`DELETE /api/folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456;
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `folder doesn't exist` } });
      });
    });
    context("Given there are folders in the database", () => {
      const testFolders = makeFolderArray();

      beforeEach("insert folders", () => {
        return db.into("folder").insert(testFolders);
      });

      it("responds with 204 and removes the folder", () => {
        const idToRemove = 2;
        const expectedFolders = testFolders.filter(
          folder => folder.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders`)
              .expect(expectedFolders)
          );
      });
    });
  });
});
