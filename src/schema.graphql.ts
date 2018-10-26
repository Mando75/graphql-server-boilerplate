import { gql } from "apollo-server";
export const typeDefs = gql`
  type Query {
    books(title: String, author: String): [Book]
  }

  type Book {
    title: String
    author: String
  }

  type Mutation {
    registerUser(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
    ): Boolean
  }
`;
