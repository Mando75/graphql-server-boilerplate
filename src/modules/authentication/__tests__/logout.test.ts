import "reflect-metadata";
import { bootstrapConnections, normalizePort } from "../../../utils";
import { Server } from "http";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { AccountType } from "../../../enums/accountType.enum";
import { TestClient } from "../../../utils";

const host = process.env.TEST_GRAPHQL_ENDPOINT as string;
let app: Server;
let db: Connection;
let userId: string;

beforeAll(async () => {
  const resp = await bootstrapConnections(normalizePort(process.env.TEST_PORT));
  if (resp) {
    app = resp.app;
    db = resp.db;
  }
  const user = await User.create({
    firstName: "Dylan",
    lastName: "Testington",
    accountType: AccountType.USER,
    email,
    password,
    emailConfirmed: true
  }).save();
  userId = user.id;
});

const email = "dylantestingtonlogout@test.com";
const password = "logouttestpassword";

describe("logout", () => {
  const tc = new TestClient(host);
  it("logs out the user", async () => {
    await tc.login(email, password);
    const response = await tc.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await tc.logout();

    const response2 = await tc.me();

    expect(response2.data.me).toBeNull();
  });
});

afterAll(async () => {
  await db.close();
  await app.close();
});
