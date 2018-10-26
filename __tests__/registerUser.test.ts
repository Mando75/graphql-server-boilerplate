import { request } from "graphql-request";
import { startServer } from "../src/startServer";
import { ServerInfo } from "apollo-server";
import { Connection } from "typeorm";

const user = `{
  email: "chucknorris@chuck.com",
  password: "chucknorris",
  firstName: "Chuck",
  lastName: "Norris"
}`;

const mutation = `
  mutation {
    registerUser(user: ${user})
  }
`;
let app: ServerInfo;
let db: Connection;
beforeAll(async () => {
  const resp = await startServer();
  app = resp.app;
  db = resp.db;
});

test("Register User", async () => {
  const resp = await request("http://localhost:4000", mutation);
  expect(resp).toEqual({ registerUser: true });
});

afterAll(async () => {
  await db.close();
  app.server.close();
});
