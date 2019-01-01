import "reflect-metadata";
import { CreateTypeORMConnection, TestClient } from "../../../utils";
import { ErrorMessages } from "../errorMessages";

const host = process.env.TEST_GRAPHQL_ENDPOINT as string;

const user = ({
  email = "chucknorris@chuck.com",
  pwd = "Password1!",
  first = "Chuck",
  last = "Chuck"
}: any) => ({
  email,
  password: pwd,
  firstName: first,
  lastName: last
});

const tc = new TestClient(host);

beforeAll(async () => {
  await CreateTypeORMConnection();
});

describe("Registering a new user", async () => {
  it("Registers a user properly", async () => {
    const resp = await tc.register(user({}), false);
    expect(resp.data.registerUser).toBe(null);
  });

  it("Can't register the same user twice", async () => {
    const {
      data: { registerUser }
    } = await tc.register(user({}), false);
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual(ErrorMessages.EMAIL_DUPLICATE);
  });

  it("catches an invalid email", async () => {
    const {
      data: { registerUser }
    } = await tc.register(user({ email: "bademail" }), false);
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual(ErrorMessages.EMAIL_INVALID_EMAIL);
  });

  it("catches short email", async () => {
    const {
      data: { registerUser }
    } = await tc.register(user({ email: "1@a.c" }), false);
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual(ErrorMessages.EMAIL_TOO_SHORT);
  });

  it("catches long email", async () => {
    const invalidEmail = `${new Array(255).join("a")}@chuck.com`;
    const {
      data: { registerUser }
    } = await tc.register(user({ email: invalidEmail }), false);
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual(ErrorMessages.EMAIL_TOO_LONG);
  });

  it("catches invalid password", async () => {
    const {
      data: { registerUser }
    } = await tc.register(
      user({ email: "newmail@mail.com", pwd: "badpwd" }),
      false
    );
    expect(registerUser).toHaveLength(2);
    expect(registerUser[0].path).toEqual("password");
    expect(registerUser[0].message).toEqual(ErrorMessages.PASSWORD_TOO_SHORT);
    expect(registerUser[1].path).toEqual("password");
    expect(registerUser[1].message).toEqual(ErrorMessages.PASSWORD_TOO_SIMPLE);
  });
});
