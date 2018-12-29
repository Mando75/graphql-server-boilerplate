import { User } from "../../entity/User";
import { AccountType } from "../../enums/accountType.enum";
import { Redis } from "ioredis";
import { v4 } from "uuid";
import { ErrorMessages } from "./errorMessages";
import { compare } from "bcrypt";
import { RedisPrefix } from "../../enums/redisPrefix.enum";

/**
 * Checks if user already exists based upon email address
 * @param email
 * @return Promise<boolean>
 */
export const userExists = async (email: string) => {
  const user = await User.findOne({
    where: { email },
    select: ["id"]
  });
  return !!user;
};

/**
 * Creates a new user in the database. Expects a user object with prehashed
 * password and AccountType.
 * @param Object with
 * @param user
 * @param hashedPwd
 * @param accountType
 */
export const registerUser = async ({
  user,
  accountType
}: {
  user: GQL.IUserRegistrationType;
  accountType: AccountType;
}) => {
  return await User.create({
    ...user,
    accountType
  }).save();
};

/**
 * Create an email confirmation link
 * @param url
 * @param userId
 * @param redis
 */
export const createConfirmEmailLink = async (
  url: string,
  userId: string,
  redis: Redis
) => {
  const id = v4();
  await redis.set(id, userId, "ex", 60 * 60 * 24);
  return `${url}/confirm/${id}`;
};

/**
 * Verify that a user's login information is correct
 * @param user
 * @param password
 */
export const verifyLogin = async (user: User, password: string) => {
  const errorResponse = {
    path: "email",
    message: ErrorMessages.INVALID_LOGIN
  };
  // Verify user exists and password matches
  const errors =
    user && (await compare(password, user.password)) ? [] : [errorResponse];

  // Verify that user email is confirmed
  if (user && !errors.length && !user.emailConfirmed) {
    errors.push({
      path: "email",
      message: ErrorMessages.EMAIL_NOT_CONFIRMED
    });
  }
  return errors;
};

/**
 * Handles logic for creating user sessions. Creates a new session with express-session,
 * and saves the session id to the user's master session list in Redis
 * @param loginAttempt
 * @param session
 * @param req
 * @param redis
 */
export const setSession = async (
  loginAttempt: User,
  session: Express.Session,
  req: Express.Request,
  redis: Redis
) => {
  session.userId = loginAttempt!.id;
  if (req.sessionID) {
    await redis.lpush(
      `${RedisPrefix.USER_SESSION}${loginAttempt!.id}`,
      req.sessionID
    );
  }
};

/**
 * Handles deleting user sessions. When a session is deleted, it will gather
 * all of the sessions the user had stored in Redis, and deletes them.
 * @param sessionIds
 * @param userId
 * @param redis
 */
export const deleteSessions = async (
  sessionIds: string[],
  userId: string,
  redis: Redis
) => {
  return new Promise(async (resolve, reject) => {
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
  });
};
