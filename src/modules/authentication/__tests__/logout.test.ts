import "reflect-metadata";
import {
  bootstrapConnections,
  normalizePort
} from "../../../utils/bootstrapConnections";
import { Server } from "http";
import { Connection } from "typeorm";
import axios from "axios";
axios.defaults.withCredentials = true;

import { User } from "../../../entity/User";
import { AccountType } from "../../../enums/accountType.enum";

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

const loginMutation = (e: string, p: string) => `
mutation {
  login(user: { email: "${e}", password: "${p}" }) {
    path
    message
  }
}
`;

const meQuery = `
{
  me {
    id
    email
  }
}
`;

const logoutMutation = `
mutation {
  logout
}
`;
const email = "dylantestingtonlogout@test.com";
const password = "logouttestpassword";

describe("logout", () => {
  test("test logging out a user", async () => {
    const loginCookie = (await axios.post(host, {
      query: loginMutation(email, password)
    })).headers["set-cookie"];

    const response = await axios.post(
      host,
      {
        query: meQuery
      },
      {
        headers: {
          Cookie: loginCookie
        }
      }
    );

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await axios.post(host, {
      query: logoutMutation
    });

    const response2 = await axios.post(host, {
      query: meQuery
    });

    expect(response2.data.data.me).toBeNull();
  });
});

afterAll(async () => {
  await db.close();
  await app.close();
});
