import { TestClient } from "../src/utils";
import { AddressInfo } from "ws";
import { Server } from "http";
import { bootstrapConnections, normalizePort } from "../src/utils";
import { Connection } from "typeorm";

export let app: Server;
export let db: Connection;
export const startTestServer = async () => {
  const resp = await bootstrapConnections(normalizePort(0));
  if (resp) {
    app = resp.app;
    const { port } = app.address() as AddressInfo;
    TestClient.setEnv(port);
    db = resp.db;
  }
};
