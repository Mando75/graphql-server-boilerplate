import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import { ApolloServer, gql } from "apollo-server";

const books = [
  {
    title: "An example book",
    author: "dickweed"
  }
];

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: () => books
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

createConnection()
  .then(async connection => {
    console.log("Connected to database");

    server.listen().then(({ url }: { url: string }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  })
  .catch(error => console.log(error));
