const app = require("../src/app");

describe("App", () => {
  it('GET / respondes with 200 and "Hello Noteful!"', () => {
    return supertest(app)
      .get("/")
      .expect(200, "Hello Noteful!");
  });
});
