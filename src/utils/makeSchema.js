"use strict";
exports.__esModule = true;
var fs = require("fs");
var graphql_tools_1 = require("graphql-tools");
/**
 * Reads through the modules directory and loads every module into the schema.
 * Each module must have a schema.graphql.ts and a resolvers.ts file. These will
 * be loaded into the schema dynamically.
 */
exports.makeSchema = function () {
    var schemas = [];
    var folders = fs.readdirSync(__dirname + "/../modules");
    folders.map(function (folder) {
        var resolvers = require(filePath(folder, "resolvers")).resolvers;
        var typeDefs = require(filePath(folder, "schema.graphql")).typeDefs;
        schemas.push(graphql_tools_1.makeExecutableSchema({ resolvers: resolvers, typeDefs: typeDefs }));
    });
    return schemas;
};
/**
 * Determine the file path of the file to import
 * @param folder
 * @param name
 */
var filePath = function (folder, name) {
    return __dirname + ("/../modules/" + folder + "/" + name);
};
