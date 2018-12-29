import { gql } from "apollo-server-express";

export const typeDefs = gql`
  input UserRegistrationType {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input UserLoginType {
    email: String!
    password: String!
  }

  type Me {
    id: ID!
    email: String!
  }

  extend type Query {
    me: Me
  }

  extend type Mutation {
    registerUser(user: UserRegistrationType): [GraphQLError!]
    login(user: UserLoginType): [GraphQLError!]
    logout: Boolean
  }
`;
