import "reflect-metadata";
import {
  bootstrapConnections,
  normalizePort,
  TestClient
} from "../../../utils";
import { Server } from "http";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import * as Redis from "ioredis";
import { createForgotPasswordLink } from "../connectors/lib";
import { ErrorMessages } from "../errorMessages";
import { lockAccount } from "../connectors/sendForgotPasswordEmail";

const redis = new Redis();
const host = process.env.TEST_GRAPHQL_ENDPOINT as string;
let app: Server;
let db: Connection;
const email = "testingforgotPassword@mail.com";
const password = "P@ssword!1";
const tc = new TestClient(host);
let user: User;

beforeAll(async () => {
  const resp = await bootstrapConnections(normalizePort(process.env.TEST_PORT));
  if (resp) {
    app = resp.app;
    db = resp.db;
  }
  user = await TestClient.createUser(email, password, true);
});

describe("forgotPassword", () => {
  // your test here
  const newPassword = "N@wP@assw0rd!";
  let url: string;
  let key: string;
  const query = (pwd: string, key: string) => `
      mutation {
        forgotPasswordChange(newPassword: "${pwd}", key: "${key}") {
        path
        message
      }
    }  
    `;
  it("locks the account", async () => {
    await lockAccount(user.id);
    url = await createForgotPasswordLink("", user.id, redis);
    const parts = url.split("/");
    key = parts[parts.length - 1];
    expect(await tc.login(email, password)).toEqual({
      data: {
        login: [
          {
            path: "email",
            message: ErrorMessages.ACCOUNT_LOCKED
          }
        ]
      }
    });
  });

  it("rejects invalid passwords", async () => {
    const response = await tc.query(query("badpassword", key));
    expect(response.data).toEqual({
      forgotPasswordChange: [
        {
          path: "newPassword",
          message: ErrorMessages.PASSWORD_TOO_SIMPLE
        }
      ]
    });
  });

  it("resets the account", async () => {
    const response = await tc.query(query(newPassword, key));
    expect(response.data).toEqual({
      forgotPasswordChange: null
    });
  });

  it("expires the redis key", async () => {
    const response = await tc.query(query(newPassword, key));
    expect(response.data).toEqual({
      forgotPasswordChange: [
        {
          path: "key",
          message: ErrorMessages.EXPIRED_KEY
        }
      ]
    });
  });

  it("allows us to log in with new password", async () => {
    const u = (await User.findOne({ email })) as User;
    console.log(u.accountLocked);
    const response = await tc.login(email, newPassword);
    expect(response.data).toEqual({ login: null });
  });
});

afterAll(async () => {
  await db.close();
  await app.close();
});
