import { registerUser } from "../lib";
import { request } from "graphql-request";
import { Connection } from "typeorm";
import * as Redis from "ioredis";
import { AccountType } from "../../../enums/accountType.enum";
import { User } from "../../../entity/User";
import { Server } from "http";
import {
  bootstrapConnections,
  normalizePort
} from "../../../utils/bootstrapConnections";
import { ErrorMessages } from "../errorMessages";

let app: Server;
let db: Connection;
const host = process.env.TEST_GRAPHQL_ENDPOINT as string;
const redis = new Redis();

beforeAll(async () => {
  const resp = await bootstrapConnections(normalizePort(process.env.TEST_PORT));
  if (resp) {
    app = resp.app;
    db = resp.db;
  }
});

describe("Logging in a user", () => {
  const password = "logintestpassword";
  const email = "dylantestingtonlogin@myemail.com";
  const loginMutation = (email: string, password: string) => `
    mutation {
      login(user: { email: "${email}", password: "${password}" }) {
        message
        path
      }
    }`;
  beforeAll(async () => {
    const user = {
      email,
      firstName: "Dylan",
      lastName: "Testington",
      password
    };
    await registerUser({
      user,
      accountType: AccountType.USER
    });
  });

  it("catches no email confirmation", async () => {
    const response = await request(host, loginMutation(email, password));
    expect(response).toEqual({
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
    const response = await request(host, loginMutation(email, password));
    expect(response).toEqual({ login: null });
  });

  it("catches bad password", async () => {
    const response = await request(host, loginMutation(email, "bad password"));
    expect(response).toEqual({
      login: [
        {
          path: "email",
          message: ErrorMessages.INVALID_LOGIN
        }
      ]
    });
  });

  it("catches bad email", async () => {
    const response = await request(
      host,
      loginMutation("bad@email.com", password)
    );
    expect(response).toEqual({
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
