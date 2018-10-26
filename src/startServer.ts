import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema.graphql";
import { resolvers } from "./resolvers";
import { CreateTypeORMConnection } from "./utils/CreateTypeORMConnection";

export const startServer = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  const db = await CreateTypeORMConnection();
  const app = await server.listen({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log(`🚀  Server ready at ${app.url}`);
  return { app, db };
};

export const app = async (): Promise<ApolloServer> => {
  await CreateTypeORMConnection();
  return new ApolloServer({ typeDefs, resolvers });
};
