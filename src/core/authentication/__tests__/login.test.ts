import { Connection } from "typeorm";
import * as Redis from "ioredis";
import { User } from "../../../entity/User";
import { Server } from "http";
import { bootstrapConnections, normalizePort } from "../../../utils";
import { ErrorMessages } from "../errorMessages";
import { TestClient } from "../../../utils";
import { AddressInfo } from "ws";

let app: Server;
let db: Connection;
let tc: TestClient;
let host: string;
const redis = new Redis();
const password = "Password1!";
const email = "dylantestingtonlogin@myemail.com";

beforeAll(async () => {
  const resp = await bootstrapConnections(normalizePort(process.env.TEST_PORT));
  if (resp) {
    app = resp.app;
    const { port } = app.address() as AddressInfo;
    TestClient.setEnv(port);
    db = resp.db;
  }

  host = process.env.TEST_GRAPHQL_ENDPOINT as string;
  tc = new TestClient(host);
  const user = {
    email,
    firstName: "Dylan",
    lastName: "Testington",
    password
  };
  await tc.register(user, false);
});

describe("Logging in a user", () => {
  it("catches no email confirmation", async () => {
    const response = await tc.login(email, password);
    expect(response.data).toEqual({
      login: [
        {
          path: "email",
          message: ErrorMessages.EMAIL_NOT_CONFIRMED
        }
      ]
    });
  });

  it("verifies proper login", async () => {
    const user = await User.findOne({ email });
    if (user) {
      user.emailConfirmed = true;
      await user.save();
    }
    const response = await tc.login(email, password);
    expect(response.data).toEqual({ login: null });
  });

  it("catches bad password", async () => {
    const response = await tc.login(email, "badpassword");
    expect(response.data).toEqual({
      login: [
        {
          path: "email",
          message: ErrorMessages.INVALID_LOGIN
        }
      ]
    });
  });

  it("catches bad email", async () => {
    const response = await tc.login("bademail@email.com", password);
    expect(response.data).toEqual({
      login: [
        {
          path: "email",
          message: ErrorMessages.INVALID_LOGIN
        }
      ]
    });
  });
});

afterAll(async () => {
  await redis.disconnect();
  await db.close();
  await app.close();
});
