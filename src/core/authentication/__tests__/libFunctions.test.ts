import {
  createConfirmEmailLink,
  registerUser,
  userExists
} from "../connectors/lib";
import { AccountType } from "../../../enums/accountType.enum";
import { User } from "../../../entity/User";
import * as Redis from "ioredis";
import * as rp from "request-promise";
import { CreateTypeORMConnection } from "../../../utils";
const redis = new Redis();
let userId: string;

beforeAll(async () => {
  await CreateTypeORMConnection();
});

describe("The register function", async () => {
  const user = {
    email: "dylantestington@myemail.com",
    firstName: "Dylan",
    lastName: "Testington",
    password: "THIS IS NOT A HASHED PASSWORD"
  };

  it("Registers a user correctly", async () => {
    const newUser = await registerUser({
      user,
      accountType: AccountType.USER
    });
    newUser.password = "";
    expect(newUser).toMatchObject({
      ...user,
      accountType: "user",
      password: "",
      active: true,
      accountLocked: false,
      acceptedToS: false,
      emailConfirmed: false,
      externalGuid: null
    });
  });
});

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
      process.env.TEST_HOST as string,
      userId,
      redis
    );

    const { msg } = await rp({ uri: url, json: true });
    expect(msg).toEqual("ok");
    const user = await User.findOne({ where: { id: userId } });
    expect((user as User).emailConfirmed).toBeTruthy();
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  });

  it("sends invalid back if bad id sent", async () => {
    try {
      await rp({
        uri: `${process.env.TEST_HOST}/confirm/12083`,
        json: true
      });
    } catch (e) {
      expect(e.statusCode).toEqual(403);
    }
  });
});

afterAll(async () => {
  await redis.disconnect();
});
