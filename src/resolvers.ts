import { IResolvers } from "graphql-tools";
import { User } from "./entity/User";
import { hash } from "bcrypt";
import { accountType } from "./enums/accountType.enum";

export const resolvers: IResolvers = {
  Query: {
    books: (_: any, { title, author }: GQL.IBooksOnQueryArguments) => [
      {
        title,
        author
      }
    ]
  },
  Mutation: {
    async registerUser(_: any, { user }: { user: GQL.IUserRegistrationType }) {
      try {
        const hashedPwd = await hash(user.password, 10);
        await User.create({
          ...user,
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
