import { createConnection, getConnectionOptions } from "typeorm";

export const CreateTypeORMConnection = async () => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
  return await createConnection({ ...connectionOptions, name: "default" });
};
