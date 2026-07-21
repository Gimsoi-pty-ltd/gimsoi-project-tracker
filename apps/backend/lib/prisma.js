import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "./generated/prisma/index.js";
const { Prisma, PrismaClient } = pkg;

export const databasePool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 30000),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 60000),
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});
const adapter = new PrismaPg(databasePool);
const basePrisma = new PrismaClient({ adapter });

const SOFT_DELETE_MODELS = ["User", "Client", "Project", "Sprint", "Task", "Phase", "Report", "Comment"];

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!SOFT_DELETE_MODELS.includes(model)) {
          return query(args);
        }

        if (["findMany", "findFirst", "findUnique", "count", "aggregate", "groupBy"].includes(operation)) {
          args.where = { ...args.where, isDeleted: false };
          return query(args);
        }

        if (operation === "delete") {
          return basePrisma[model].update({
            ...args,
            data: { isDeleted: true },
          });
        }

        if (operation === "deleteMany") {
          return basePrisma[model].updateMany({
            ...args,
            data: { isDeleted: true },
          });
        }

        return query(args);
      },
    },
  },
});

export { basePrisma as rawPrisma, Prisma };
export default prisma;
