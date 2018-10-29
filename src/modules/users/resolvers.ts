import { hash } from "bcrypt";
import { accountType } from "../../enums/accountType.enum";
import { ResolverMap } from "../../types/graphql-utils";
import { registerUser, userExists } from "./lib";
import IUserRegistrationType = GQL.IUserRegistrationType;

export const resolvers: ResolverMap = {
  Mutation: {
    /**
     * TODO: Return type User
     * Registers a new user of type 'user' in the database
     * Returns whether the save was successful
     * @param _
     * @param user
     */
    async registerUser(_: any, { user }: { user: IUserRegistrationType }) {
      try {
        if (await userExists(user.email)) {
          return [
            {
              path: "email",
              message: "already exists"
            }
          ];
        }

        // hash password before insertion
        const hashedPwd = await hash(user.password, 10);
        await registerUser({
          user,
          hashedPwd,
          accountType: accountType.USER
        });
        return null;
      } catch (err) {
        console.log(err);
        return [
          {
            path: "register",
            message: "user could not be registered"
          }
        ];
      }
    }
  }
};
