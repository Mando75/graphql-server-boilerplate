import { request } from "graphql-request";
import "reflect-metadata";
import {
  bootstrapConnections,
  normalizePort
} from "../../../utils/bootstrapConnections";
import { ServerInfo } from "apollo-server";
import { Connection } from "typeorm";

const user = `{
  email: "chucknorris@chuck.com",
  password: "chucknorris",
  firstName: "Chuck",
  lastName: "Norris"
}`;

const mutation = (user: string) => `
  mutation {
    registerUser(user: ${user}) {
      path
      message
    }
  }
`;

let app: ServerInfo;
let db: Connection;

beforeAll(async () => {
  const resp = await bootstrapConnections(normalizePort(global.port));
  if (resp) {
    app = resp.app;
    db = resp.db;
  }
});

describe("Registering a new user", async () => {
  it("Registers a user properly", async () => {
    const resp: any = await request(global.host, mutation(user));
    expect(resp.registerUser).toBe(null);
  });

  it("Can't register the same user twice", async () => {
    const { registerUser }: any = await request(global.host, mutation(user));
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual("already exists");
  });
});

afterAll(async () => {
  await db.close();
  app.server.close();
});
