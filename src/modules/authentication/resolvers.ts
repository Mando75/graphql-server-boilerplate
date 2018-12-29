import { AccountType } from "../../enums/accountType.enum";
import { ResolverMap } from "../../types/graphql-utils";
import { Session } from "../../types/context";
import {
  createConfirmEmailLink,
  registerUser,
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
  Query: {
    me: async (_: any, __: any, { session }: { session: Session }) => {
      console.log(session.userId);
      return await User.findOne({
        select: ["id", "email"],
        where: { id: session.userId }
      });
    }
  },
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

      session.userId = loginAttempt!.id;
      if (req.sessionID) {
        await redis.lpush(
          `${RedisPrefix.USER_SESSION}${loginAttempt!.id}`,
          req.sessionID
        );
      }

      return null;
    },
    logout(_: any, __: any, { session, redis }) {
      return new Promise(async (resolve, reject) => {
        const { userId } = session;
        if (userId) {
          const sessionIds = await redis.lrange(
            `${RedisPrefix.USER_SESSION}${userId}`,
            0,
            -1
          );

          const promises = sessionIds.map((id: string) =>
            redis.del(`${RedisPrefix.REDIS_SESSION}${id}`)
          );
          promises.push(redis.del(`${RedisPrefix.USER_SESSION}${userId}`));
          try {
            await Promise.all(promises);
            resolve(true);
          } catch (e) {
            reject(false);
          }
        } else {
          reject(false);
        }
      });
    }
  }
};
