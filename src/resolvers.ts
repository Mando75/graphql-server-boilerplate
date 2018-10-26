import { IResolvers } from "graphql-tools";
import * as bcrypt from "bcrypt";
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
    async registerUser(_, args: GQL.IRegisterUserOnMutationArguments) {
      try {
        const hashedPwd = await hash(args.password, 10);
        await User.create({
          ...args,
          password: hashedPwd,
          accountType: accountType.USER
        }).save();
        return true;
      } catch (err) {}
    }
  }
};
