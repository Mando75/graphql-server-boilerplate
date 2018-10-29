import { ResolverMap } from "./types/graphql-utils";

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
    _empty: () => false
  }
};
