import { ApolloServer } from "apollo-server-express";
import { makeSchema } from "./makeSchema";
import { CreateTypeORMConnection } from "./CreateTypeORMConnection";
import { Connection } from "typeorm";
import { GraphQLSchema } from "graphql";
import { Server } from "http";
import * as express from "express";
import routes from "./expressRoutes";
import * as Redis from "ioredis";

export const redis = new Redis();
/**
 * Try to bootstrap a database and server connection. If successful,
 * returns the db and server connection instances in an object
 * @param port -> Http server will liston on this port
 */
export const bootstrapConnections = async (port: number) => {
  let db: Connection, app: Server;
  const server = express();
  server.use(routes);
  try {
    // Connect to Database
    db = await CreateTypeORMConnection();
    console.log(`Connected to db ${db.options.database}`);

    // Load GraphQL Schema files
    const schema: GraphQLSchema = await makeSchema();

    // Start Apollo Server
    const apolloServer = new ApolloServer({
      schema,
      formatError: (error: Error) => {
        console.log(error);
        return error;
      },
      formatResponse: (response: Response) => {
        console.log(response);
        return response;
      },
      context: ({ req }: any) => ({
        redis,
        url: `${req.protocol}://${req.get("host")}`
      })
    });
    apolloServer.applyMiddleware({ app: server, path: "/graphql" });
    app = await server.listen({
      port
    });

    console.log(`🚀  Server ready at ${port}: Happy Coding!`);
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
