import { ApolloServer, ServerInfo } from "apollo-server";
import { typeDefs } from "../schema.graphql";
import { resolvers } from "../resolvers";
import { CreateTypeORMConnection } from "./CreateTypeORMConnection";
import { Connection } from "typeorm";

// @ts-ignore
/**
 * Try to bootstrap a database and server connection. If successful,
 * returns the db and server connection instances in an object
 * @param port -> Http server will liston on this port
 */
export const bootstrapConnections = async (port: number) => {
  let db: Connection, app: ServerInfo;
  try {
    const server = new ApolloServer({ typeDefs, resolvers });
    db = await CreateTypeORMConnection();
    console.log(`Connected to db ${db.name}`);
    app = await server.listen({
      port: port
    });

    console.log(`🚀  Server ready at ${app.url}`);
    return { app, db };
  } catch (e) {
    console.error("Could not bootstrap server connections. Exiting", e);
    process.exit(1);
    return null;
  }
};

/**
 * Attempt to normalize port value
 * @param val
 */
export const normalizePort = (val: any) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) return val;

  if (port >= 0) return port;

  return false;
};
