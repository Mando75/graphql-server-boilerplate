import { ApolloServer, ServerInfo } from "apollo-server";
import { makeSchema } from "./makeSchema";
import { CreateTypeORMConnection } from "./CreateTypeORMConnection";
import { Connection } from "typeorm";
import { GraphQLSchema } from "graphql";

// @ts-ignore
/**
 * Try to bootstrap a database and server connection. If successful,
 * returns the db and server connection instances in an object
 * @param port -> Http server will liston on this port
 */
export const bootstrapConnections = async (port: number) => {
  let db: Connection, app: ServerInfo;
  try {
    db = await CreateTypeORMConnection();
    const schema: GraphQLSchema = await makeSchema();
    const server = new ApolloServer({
      schema,
      formatError: (error: Error) => {
        console.log(error);
        return error;
      },
      formatResponse: (response: Response) => {
        console.log(response);
        return response;
      }
    });
    console.log(`Connected to db ${db.options.database}`);
    app = await server.listen({
      port: port
    });

    console.log(`🚀  Server ready at ${app.url}: Happy Coding!`);
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
