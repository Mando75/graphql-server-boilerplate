import { gql } from "apollo-server";

export const typeDefs = gql`
  type Query {
    books(title: String, author: String): [Book]
  }

  type Book {
    title: String
    author: String
  }

  type GraphQLError {
    path: String!
    message: String!
  }

  type Mutation {
    _empty: Boolean
  }
`;
