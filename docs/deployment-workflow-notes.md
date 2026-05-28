# Sprint 4 – Deployment Workflow Notes

## Trigger Strategy
For now, deployment is configured to be triggered:
- manually through workflow_dispatch
- on pushes to main

This keeps deployment controlled while the Zoho Catalyst setup is still being confirmed.

## Environment Variables
Deployment-related environment variables will be stored in GitHub Secrets once finalized.

Examples:
- JWT_SECRET
- CLIENT_URL
- DATABASE_URL
- CATALYST_PROJECT_ID
- CATALYST_TOKEN

## Current Status
The deployment workflow is currently prepared but not yet connected to Zoho Catalyst.
This allows the team to finalize the hosting platform setup before enabling live deployment.

## Packaging Strategy
Backend and frontend artifacts are packaged separately in CI and uploaded as artifacts for later deployment use.