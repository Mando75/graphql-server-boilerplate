import { gql } from "apollo-server";
export const typeDefs = gql`
  type Query {
    books(title: String, author: String): [Book]
  }

  type Book {
    title: String
    author: String
  }

  input UserRegistrationType {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  type Mutation {
    registerUser(user: UserRegistrationType): Boolean
  }
`;
