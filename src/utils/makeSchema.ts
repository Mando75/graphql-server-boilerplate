import * as fs from "fs";
import { makeExecutableSchema } from "graphql-tools";

/**
 * Reads through the modules directory and loads every module into the schema.
 * Each module must have a schema.root.graphql.ts and a resolvers.root.ts file. These will
 * be loaded into the schema dynamically.
 */
export const makeSchema = () => {
  const root = getRootSchema();
  const resolversCollection = [root.resolvers];
  const typeDefsCollection = [root.typeDefs];
  const folders: string[] = fs.readdirSync(__dirname + `/../modules`);
  folders.forEach((folder: string) => {
    const { resolvers } = require(filePath(folder, "resolvers"));
    const { typeDefs } = require(filePath(folder, "schema.graphql"));
    resolversCollection.push(resolvers);
    typeDefsCollection.push(typeDefs);
  });

  return makeExecutableSchema({
    resolvers: resolversCollection,
    typeDefs: typeDefsCollection
  });
};

/**
 * Get the root schema elements and return them as executable schema
 */
const getRootSchema = () => {
  const { typeDefs } = require(__dirname + `/../schema.root.graphql`);
  const { resolvers } = require(__dirname + `/../resolvers.root`);
  return { resolvers, typeDefs };
};

/**
 * Determine the file path of the file to import
 * @param folder
 * @param name
 */
const filePath = (folder: string, name: string) =>
  __dirname + `/../modules/${folder}/${name}`;
