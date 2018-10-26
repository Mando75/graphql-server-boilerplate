import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema.graphql";
import { resolvers } from "./resolvers";

const server = new ApolloServer({ typeDefs, resolvers });
createConnection().then(() => {
  server.listen().then(({ url }: { url: string }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
});
