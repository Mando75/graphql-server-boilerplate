import { User } from "../../entity/User";
import { hash } from "bcrypt";
import { accountType } from "../../enums/accountType.enum";
import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    books: (_: any, { title, author }: GQL.IBooksOnQueryArguments) => [
      {
        title,
        author
      }
    ]
  },
  Mutation: {
    /**
     * TODO: Return type User
     * Registers a new user of type 'user' in the database
     * Returns whether the save was successful
     * @param _
     * @param user
     */
    async registerUser(_: any, { user }: { user: GQL.IUserRegistrationType }) {
      try {
        // hash password before insertion
        const hashedPwd = await hash(user.password, 10);
        await User.create({
          ...user,
          // replace password field with new hashed password
          password: hashedPwd,
          accountType: accountType.USER
        }).save();
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }
};
