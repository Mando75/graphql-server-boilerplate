import { request } from "graphql-request";
import "reflect-metadata";
import {
  bootstrapConnections,
  normalizePort
} from "../src/utils/bootstrapConnections";
import { ServerInfo } from "apollo-server";
import { Connection } from "typeorm";

const port = 4001;

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
  const resp = await bootstrapConnections(normalizePort(port));
  if (resp) {
    app = resp.app;
    db = resp.db;
  }
});

test("Register User", async () => {
  const resp = await request(`http://localhost:${port}`, mutation);
  expect(resp).toEqual({ registerUser: true });
});

afterAll(async () => {
  await db.close();
  app.server.close();
});
