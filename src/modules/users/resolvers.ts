import { hash } from "bcrypt";
import { AccountType } from "../../enums/accountType.enum";
import { ResolverMap } from "../../types/graphql-utils";
import { createConfirmEmailLink, registerUser, userExists } from "./lib";
import IUserRegistrationType = GQL.IUserRegistrationType;
import { yupUserRegistrationSchema } from "./schema.graphql";
import { formatYupError } from "../../utils/formatYupError";
import { ErrorMessages } from "../../enums/errorMessages";

export const resolvers: ResolverMap = {
  Mutation: {
    /**
     * TODO: Return type User
     * Registers a new user of type 'user' in the database
     * Returns whether the save was successful
     * @param _
     * @param user
     * @param redis
     * @param url
     */
    async registerUser(
      _: any,
      { user }: { user: IUserRegistrationType },
      { redis, url }
    ) {
      try {
        await yupUserRegistrationSchema.validate(user, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }
      try {
        if (await userExists(user.email)) {
          return [
            {
              path: "email",
              message: ErrorMessages.EMAIL_DUPLICATE
            }
          ];
        }

        // hash password before insertion
        const hashedPwd = await hash(user.password, 10);
        const newUser = await registerUser({
          user,
          hashedPwd,
          accountType: AccountType.USER
        });

        const link = await createConfirmEmailLink(url, newUser.id, redis);
        console.log(link);
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
