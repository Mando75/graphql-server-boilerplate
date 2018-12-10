import { Redis } from "ioredis";

export interface Context {
  redis: Redis;
  url: string;
  session: Session;
}

export interface Session extends Express.Session {
  userId?: string;
}
