import { gql } from "apollo-server";
export const typeDefs = gql`
  input UserRegistrationType {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  extend type Mutation {
    registerUser(user: UserRegistrationType): [GraphQLError!]
  }
`;
