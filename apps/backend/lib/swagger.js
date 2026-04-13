import swaggerJsdoc from "swagger-jsdoc";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "System Status",
      version,
    },
  },
  apis: ["./routes/health.route.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
