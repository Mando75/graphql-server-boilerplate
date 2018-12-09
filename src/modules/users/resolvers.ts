import { hash } from "bcrypt";
import { AccountType } from "../../enums/accountType.enum";
import { ResolverMap } from "../../types/graphql-utils";
import {
  createConfirmEmailLink,
  registerUser,
  userExists,
  verifyLogin
} from "./lib";
import IUserRegistrationType = GQL.IUserRegistrationType;
import { yupUserLoginSchema, yupUserRegistrationSchema } from "./yup.schema";
import { formatYupError } from "../../utils/formatYupError";
import { ErrorMessages } from "./errorMessages";
import { sendConfirmEmail } from "../../utils/sendEmail";

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
        await sendConfirmEmail({
          to: user.email,
          link
        });
        return null;
      } catch (err) {
        return [
          {
            path: "register",
            message: ErrorMessages.GENERIC_FAILURE
          }
        ];
      }
    },
    async login(_: any, { user }: { user: GQL.IUserLoginType }) {
      try {
        await yupUserLoginSchema.validate(user, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }
      const errors = await verifyLogin(user.email, user.password);
      if (errors.length) {
        return errors;
      }
      return null;
    }
  }
};
