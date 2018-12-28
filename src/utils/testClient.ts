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

  async register(email: string, password: string, confirmEmail: boolean) {
    const resp = rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            register(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `
      }
    });
    if (confirmEmail) {
      const user = await User.findOne({ email });
      if (user) {
        user.emailConfirmed = true;
        await user.save();
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
          login(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `
      }
    });
  }
}
