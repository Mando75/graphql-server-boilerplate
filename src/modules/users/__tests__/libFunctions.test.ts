import { registerUser, userExists } from "../lib";
import { CreateTypeORMConnection } from "../../../utils/CreateTypeORMConnection";
import { Connection } from "typeorm";
import { AccountType } from "../../../enums/accountType.enum";

let db: Connection;

beforeAll(async () => {
  db = await CreateTypeORMConnection();
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

afterAll(async () => {
  await db.close();
});
