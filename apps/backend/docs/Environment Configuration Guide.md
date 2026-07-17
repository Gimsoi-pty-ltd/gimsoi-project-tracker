# Environment Configuration Guide

## Purpose

This document describes the environment configuration for the project. It provides developers with the information required to understand, configure and recreate the application's current development environment.

The organisation is currently in the development phase and therefore does not yet maintain separate Development, Testing, Staging or Production environments with dedicated environment-specific configuration files.

---

# Environment Overview

The application consists of a React frontend and a Node.js backend.

The frontend is built using Vite and deployed using Zoho Catalyst Web Client Hosting.

The backend is an Express application deployed using Catalyst AppSail and connects to a PostgreSQL database using Prisma ORM.

Application configuration is managed primarily through environment variables.

---

# Environment Architecture

Current Architecture

Developer Machine

↓

Frontend (React + Vite)

↓

Backend (Express + Prisma)

↓

PostgreSQL Database

↓

Catalyst Deployment

• Web Client Hosting (Frontend)

• AppSail (Backend)

---

# Prerequisites

Before running the application locally, ensure the following software is installed:

- Node.js
- npm
- Git
- PostgreSQL (if required locally)
- Catalyst CLI (where applicable)

Repository access is also required.

---

# Environment Variables

The project uses environment variables to separate configuration from application code.

Typical variables include:

| Variable | Description | Example |
|-----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `<DATABASE_URL>` |
| JWT_SECRET | JWT signing secret | `<JWT_SECRET>` |
| CLIENT_URL | Frontend application URL | `<CLIENT_URL>` |
| PORT | Backend application port | `<PORT>` |
| VITE_API_URL | Backend API endpoint | `<VITE_API_URL>` |
| VITE_BACKEND_URL | Backend URL | `<VITE_BACKEND_URL>` |

Placeholder values are intentionally used within the `.env.example` file.

Sensitive credentials must never be committed to source control.

---

# Where Variables Are Configured

Configuration is managed in different locations depending on the environment.

| Location | Purpose |
|----------|---------|
| Local `.env` | Local development configuration |
| `.env.example` | Environment template with placeholders |
| Catalyst Environment Variables | Production deployment configuration |
| GitHub Secrets | CI/CD secrets (where applicable) |

---

# Local Development Setup

To configure the application locally:

1. Clone the repository.
2. Install project dependencies.
3. Create a local `.env` file using `.env.example`.
4. Replace placeholder values with valid local configuration.
5. Start the backend.
6. Start the frontend.

Detailed installation instructions are available within the project README.

---

# Catalyst Deployment Configuration

The deployed environment consists of:

Frontend
- Catalyst Web Client Hosting

Backend
- Catalyst AppSail

Environment variables are configured through Catalyst rather than committed to the repository.

---

# Local vs Deployed Environment

| Local Development | Catalyst Deployment |
|-------------------|--------------------|
| Uses local `.env` | Uses Catalyst Environment Variables |
| Local database connection | Hosted database connection |
| Local application ports | Catalyst assigned ports |
| Developer machine | Cloud infrastructure |

---

# Configuration Files

Important configuration files include:

- `.env.example`
- `.env`
- `package.json`
- `vite.config.js`
- `catalyst.json`
- `apps/backend/*`

---

# Common Configuration Issues

Common issues include:

- Missing environment variables
- Incorrect database connection strings
- Invalid JWT secret
- Incorrect API URLs
- Incorrect application ports
- Missing dependencies

---

# Troubleshooting

If the application fails to start:

- Verify all required environment variables are present.
- Confirm PostgreSQL is accessible.
- Ensure dependencies have been installed.
- Verify frontend and backend URLs match.
- Review application logs for configuration errors.

---

# Best Practices

Developers should:

- Never commit secrets to source control.
- Keep `.env.example` up to date.
- Use placeholder values within templates.
- Store production secrets within Catalyst.
- Update documentation whenever configuration changes.

Detailed security guidance is available in the project's Security documentation.

---

# Future Considerations

As the organisation matures, dedicated Development, Testing, Staging and Production environments should be introduced.

At that stage:

- Environment-specific variable sets should be maintained.
- Deployment documentation should be expanded.
- CI/CD environment configuration should be standardised.
- Separate deployment workflows should be documented.

Until then, the current documentation reflects the project's existing development environment and configuration strategy.