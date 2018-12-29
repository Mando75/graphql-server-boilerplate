import "reflect-metadata";
import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import { makeSchema } from "./makeSchema";
import { CreateTypeORMConnection } from "./CreateTypeORMConnection";
import { Connection } from "typeorm";
import { GraphQLSchema } from "graphql";
import { Server } from "http";
import * as express from "express";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import { routes } from "../routes";
import * as Redis from "ioredis";
import { applyMiddleware } from "graphql-middleware";
import { createShield } from "./createShield";

export const redis = new Redis({
  retryStrategy(): number | false {
    return false;
  }
});
redis.on("error", () => {
  console.log("Error connecting");
  redis.disconnect();
});
/**
 * Try to bootstrap a database and server connection. If successful,
 * returns the db and server connection instances in an object
 * @param port -> Http server will liston on this port
 */
export const bootstrapConnections = async (port: number) => {
  let db: Connection, app: Server;
  const server = express();
  server.use(session(createSession()));
  server.use(routes);
  try {
    // Connect to Database
    db = await CreateTypeORMConnection();
    // await db.runMigrations();
    console.log(`Connected to db ${db.options.database}`);

    // Load GraphQL Schema files
    const schema: GraphQLSchema = applyMiddleware(
      await makeSchema(),
      createShield()
    );

    // Start Apollo Server
    const apolloServer = new ApolloServer({
      schema,
      formatError,
      formatResponse,
      context: setContext
    });

    apolloServer.applyMiddleware({ app: server, path: "/graphql", cors });
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

/**
 * Return the context object for Apollo requests
 * @param req
 */
const setContext = ({ req }: any) => ({
  redis,
  url: `${req.protocol}://${req.get("host")}`,
  session: req.session,
  req: req
});
/**
 * Request response formatting
 * @param response
 */
const formatResponse = (response: Response) => {
  console.log(response);
  return response;
};

/**
 * Formatting error response
 * @param error
 */
const formatError = (error: Error) => {
  console.log(error);
  return error;
};

/**
 * Configuration for session storage
 */
const createSession = () => {
  const RedisStore = connectRedis(session);
  return {
    store: new RedisStore({
      client: redis as any,
      prefix: process.env.REDIS_SESSION_PREFIX
    }),
    name: "bid",
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  };
};

/**
 * Cors configuration
 */
const cors = {
  credentials: true,
  origin: (process.env.HOST || process.env.TEST_HOST) as string
};
