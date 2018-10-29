import { User } from "../../entity/User";
import { accountType } from "../../enums/accountType.enum";

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
 * password and accountType.
 * @param Object with
 * @param user
 * @param hashedPwd
 * @param accountType
 */
export const registerUser = async ({
  user,
  hashedPwd,
  accountType
}: {
  user: GQL.IUserRegistrationType;
  hashedPwd: string;
  accountType: accountType;
}) => {
  return await User.create({
    ...user,
    password: hashedPwd,
    accountType
  }).save();
};
