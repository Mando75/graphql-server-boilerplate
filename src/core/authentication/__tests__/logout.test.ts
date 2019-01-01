import "reflect-metadata";
import { CreateTypeORMConnection, TestClient } from "../../../utils";
import { User } from "../../../entity/User";
import { AccountType } from "../../../enums/accountType.enum";

const host = process.env.TEST_GRAPHQL_ENDPOINT as string;
let userId: string;

beforeAll(async () => {
  await CreateTypeORMConnection();
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
  it("logs out the user of a single session", async () => {
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

  it("logs out of multiple sessions", async () => {
    const sess1 = new TestClient(host);
    const sess2 = new TestClient(host);
    await sess1.login(email, password);
    await sess2.login(email, password);
    expect(await sess1.me()).toEqual(await sess2.me());
    await sess1.logout();
    // Logout should destroy both sessions
    expect(await sess1.me()).toEqual(await sess2.me());
  });
});
