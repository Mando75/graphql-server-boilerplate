import { request } from "graphql-request";
import "reflect-metadata";
import { bootstrapConnections, normalizePort } from "../../../utils";
import { Server } from "http";
import { Connection } from "typeorm";
import { ErrorMessages } from "../errorMessages";

const host = process.env.TEST_GRAPHQL_ENDPOINT as string;
const mutation = (user: string) => `
  mutation {
    registerUser(user: ${user}) {
      path
      message
    }
  }
`;

const user = ({
  email = "chucknorris@chuck.com",
  pwd = "Password1!",
  first = "Chuck",
  last = "Chuck"
}: any) => `{
  email: "${email}",
  password: "${pwd}",
  firstName: "${first}",
  lastName: "${last}"
}`;

let app: Server;
let db: Connection;

beforeAll(async () => {
  const resp = await bootstrapConnections(normalizePort(process.env.TEST_PORT));
  if (resp) {
    app = resp.app;
    db = resp.db;
  }
});

describe("Registering a new user", async () => {
  it("Registers a user properly", async () => {
    const resp: any = await request(host, mutation(user({})));
    expect(resp.registerUser).toBe(null);
  });

  it("Can't register the same user twice", async () => {
    const { registerUser }: any = await request(host, mutation(user({})));
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual(ErrorMessages.EMAIL_DUPLICATE);
  });

  it("catches an invalid email", async () => {
    const { registerUser }: any = await request(
      host,
      mutation(user({ email: "bademail" }))
    );
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual(ErrorMessages.EMAIL_INVALID_EMAIL);
  });

  it("catches short email", async () => {
    const { registerUser }: any = await request(
      host,
      mutation(user({ email: "1@a.c" }))
    );
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual(ErrorMessages.EMAIL_TOO_SHORT);
  });

  it("catches long email", async () => {
    const invalidEmail = `${new Array(255).join("a")}@chuck.com`;
    const { registerUser }: any = await request(
      host,
      mutation(user({ email: invalidEmail }))
    );
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("email");
    expect(registerUser[0].message).toEqual(ErrorMessages.EMAIL_TOO_LONG);
  });

  it("catches invalid password", async () => {
    const { registerUser }: any = await request(
      host,
      mutation(user({ pwd: "badpassword", email: "new@mail.com" }))
    );
    expect(registerUser).toHaveLength(1);
    expect(registerUser[0].path).toEqual("password");
    expect(registerUser[0].message).toEqual(ErrorMessages.PASSWORD_TOO_SIMPLE);
  });
});

afterAll(async () => {
  await db.close();
  await app.close();
});
