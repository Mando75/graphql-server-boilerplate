import * as fs from "fs";
import { makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";

/**
 * Reads through the modules directory and loads every module into the schema.
 * Each module must have a schema.graphql.ts and a resolvers.ts file. These will
 * be loaded into the schema dynamically.
 */
export const makeSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders: string[] = fs.readdirSync(__dirname + `/../modules`);
  folders.map((folder: string) => {
    const { resolvers } = require(filePath(folder, "resolvers"));
    const { typeDefs } = require(filePath(folder, "schema.graphql"));
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  return schemas;
};

/**
 * Determine the file path of the file to import
 * @param folder
 * @param name
 */
const filePath = (folder: string, name: string) =>
  __dirname + `/../modules/${folder}/${name}`;
