import * as rp from "request-promise";
import { User } from "../entity/User";

export class TestClient {
  url: string;
  options: {
    jar: any;
    withCredentials: boolean;
    json: boolean;
  };

  constructor(url: string) {
    this.url = url;
    this.options = {
      jar: rp.jar(),
      withCredentials: true,
      json: true
    };
  }

  async register(
    user: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    confirmEmail: boolean
  ) {
    const resp = rp.post(this.url, {
      ...this.options,
      body: {
        query: `mutation {
                  registerUser(user: {
                    firstName: "${user.firstName}",
                    lastName: "${user.lastName}",
                    password: "${user.password}",
                    email: "${user.email}"
                  }) {
                    message
                    path
                  }
                }`
      }
    });
    if (confirmEmail) {
      const ruser = await User.findOne({ email: user.email });
      if (ruser) {
        ruser.emailConfirmed = true;
        await ruser.save();
      }
    }
    return resp;
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          logout
        }
        `
      }
    });
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          {
            me {
              id
              email
            }
          }
        `
      }
    });
  }

  async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          login(user: { email: "${email}", password: "${password}" }) {
            path
            message
          }
        }
        `
      }
    });
  }
}
