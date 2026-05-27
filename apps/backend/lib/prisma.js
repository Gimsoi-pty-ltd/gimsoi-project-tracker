import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "./generated/prisma/index.js";
const { Prisma, PrismaClient } = pkg;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 30000,
});
const adapter = new PrismaPg(pool);
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
