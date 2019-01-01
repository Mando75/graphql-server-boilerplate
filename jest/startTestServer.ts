import { TestClient } from "../../../utils";
import { AddressInfo, Server } from "ws";
import { bootstrapConnections, normalizePort } from "../src/utils";
import { Connection } from "typeorm";

export let app: Server;
export let db: Connection;
export const startTestServer = async () => {
  const resp = await bootstrapConnections(normalizePort(process.env.TEST_PORT));
  if (resp) {
    app = resp.app;
    const { port } = app.address() as AddressInfo;
    TestClient.setEnv(port);
    db = resp.db;
  }
};
