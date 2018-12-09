import { Redis } from "ioredis";

export interface ResolverMap {
  [key: string]: {
    [key: string]: (
      parent: any,
      args: any,
      context: {
        redis: Redis;
        url: string;
        session: Session;
      },
      info: any
    ) => any;
  };
}

export interface Session {
  userId?: string;
}
