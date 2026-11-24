import swaggerJsdoc from "swagger-jsdoc";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gimsoi Project Tracker API",
      version,
      description:
        "Backend REST API documentation for the Gimsoi Project Tracker, covering Project Health, Workload Management, Notifications, and Core Services.",
    },
    servers: [
      {
        url: "/api",
        description: "API Base URL",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT Bearer token or pass via cookie",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT authentication cookie",
        },
      },
    },
  },
  apis: [
    "./routes/health.route.js",
    "./routes/analytics.route.js",
    "./routes/notification.route.js",
    "./routes/employee.route.js",
    "./routes/project.route.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

