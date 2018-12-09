import { createConfirmEmailLink, registerUser, userExists } from "../lib";
import { request } from "graphql-request";
import { Connection } from "typeorm";
import { AccountType } from "../../../enums/accountType.enum";
import { User } from "../../../entity/User";
import { Server } from "http";
import * as Redis from "ioredis";
import * as fetch from "node-fetch";
import {
  bootstrapConnections,
  normalizePort
} from "../../../utils/bootstrapConnections";
import { hash } from "bcrypt";
import { ErrorMessages } from "../errorMessages";

let app: Server;
let db: Connection;
const host = process.env.TEST_GRAPHQL_ENDPOINT as string;

beforeAll(async () => {
  const resp = await bootstrapConnections(normalizePort(process.env.TEST_PORT));
  if (resp) {
    app = resp.app;
    db = resp.db;
  }
});

describe("The register function", async () => {
  const user = {
    email: "dylantestington@myemail.com",
    firstName: "Dylan",
    lastName: "Testington",
    password: "THIS IS NOT A HASHED PASSWORD"
  };
  const hashedPwd = "THIS IS A HASHED PASSWORD";

  it("Registers a user correctly", async () => {
    const newUser = await registerUser({
      user,
      hashedPwd,
      accountType: AccountType.USER
    });
    expect(newUser).toMatchObject({
      ...user,
      password: "THIS IS A HASHED PASSWORD",
      accountType: "user",
      active: true,
      accountLocked: false,
      acceptedToS: false,
      emailConfirmed: false,
      externalGuid: null
    });
  });
});

const redis = new Redis();
let userId: string;
describe("User exists", async () => {
  it("returns true when a user exists", async () => {
    const email = "dylantestington@myemail.com";
    expect(await userExists(email)).toBe(true);
  });

  it("returns false when a user does not exist", async () => {
    const email = "FAKEEMAIL";
    expect(await userExists(email)).toBe(false);
  });
});

describe("createEmailConfirmationLink", () => {
  beforeAll(async () => {
    const user = await User.create({
      email: "createConfirmUser@test.com",
      password: "hashedpassword",
      firstName: "test",
      lastName: "test",
      accountType: AccountType.USER
    }).save();
    userId = user.id;
  });
  it("confirms the users and clears the redis key", async () => {
    const url = await createConfirmEmailLink(
      "http://localhost:4001",
      userId,
      redis
    );

    const response = await fetch(url);
    const { msg } = await response.json();
    expect(msg).toEqual("ok");
    const user = await User.findOne({ where: { id: userId } });
    expect((user as User).emailConfirmed).toBeTruthy();
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  });

  test("sends invalid back if bad id sent", async () => {
    const response = await fetch(`http://localhost:4001/confirm/12083`);
    const { msg } = await response.json();
    expect(msg).toEqual("invalid");
  });
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
    const hashed = await hash(password, 10);
    const user = {
      email,
      firstName: "Dylan",
      lastName: "Testington",
      password
    };
    await registerUser({
      user,
      hashedPwd: hashed,
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
    const response = await request(host, loginMutation("bad email", password));
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
