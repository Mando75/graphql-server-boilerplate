import {
  bootstrapConnections,
  normalizePort
} from "./utils/bootstrapConnections";

bootstrapConnections(normalizePort(process.env.PORT || "4000"));
