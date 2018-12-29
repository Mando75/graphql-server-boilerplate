import { AccountType } from "../../enums/accountType.enum";
import { ResolverMap } from "../../types/graphql-utils";
import {
  createConfirmEmailLink,
  deleteSessions,
  registerUser,
  setSession,
  userExists,
  verifyLogin
} from "./lib";
import { yupUserLoginSchema, yupUserRegistrationSchema } from "./yup.schema";
import { formatYupError } from "../../utils";
import { ErrorMessages } from "./errorMessages";
import { sendConfirmEmail } from "../../utils";
import { User } from "../../entity/User";
import { RedisPrefix } from "../../enums/redisPrefix.enum";

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
      { user }: { user: GQL.IUserRegistrationType },
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

        const newUser = await registerUser({
          user,
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
    async login(
      _: any,
      { user }: { user: GQL.IUserLoginType },
      { session, redis, req }
    ) {
      try {
        await yupUserLoginSchema.validate(user, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }
      const loginAttempt = await User.findOne({ email: user.email });
      const errors = await verifyLogin(loginAttempt as User, user.password);
      if (errors.length) {
        return errors;
      }
      await setSession(loginAttempt as User, session, req, redis);
      return null;
    },
    async logout(_: any, __: any, { session, redis }) {
      const { userId } = session;
      if (userId) {
        const sessionIds = await redis.lrange(
          `${RedisPrefix.USER_SESSION}${userId}`,
          0,
          -1
        );
        return await deleteSessions(sessionIds, userId, redis);
      } else {
        return false;
      }
    }
  }
};
