import { setSession } from "./lib";
import { User } from "../../../entity/User";
import { formatYupError } from "../../../utils";
import { yupUserLoginSchema } from "../yup.schema";
import { Context } from "../../../types/context";
import { ErrorMessages } from "../errorMessages";
import { compare } from "bcrypt";

/**
 * Logic for login mutation
 * Validates the login information with Yup, verifies info is correct,
 * and creates a new session
 * @param _
 * @param user
 * @param session
 * @param redis
 * @param req
 */
export const login = async (
  _: any,
  { user }: { user: GQL.IUserLoginType },
  { session, redis, req }: Context
) => {
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

  if (user && !errors.length && user.accountLocked) {
    errors.push({
      path: "email",
      message: ErrorMessages.ACCOUNT_LOCKED
    });
  }
  return errors;
};
