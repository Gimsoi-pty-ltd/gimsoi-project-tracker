# Sprint 2 API Contract (Clients + Projects)

## Base URL
- http://localhost:5001

## Auth
- Protected endpoints require:
  Authorization: Bearer <JWT>

## Clients
### POST /api/clients (Admin, PM)
Request:
{
  "name": "Acme",
  "contactEmail": "client@acme.com"
}

Response:
{
  "message": "Client created",
  "data": { ...client }
}

### GET /api/clients (All logged-in roles)
Response:
{ "data": [ ...clients ] }

### GET /api/clients/:id (All logged-in roles)
Response:
{ "data": { ...client } }

## Projects
### POST /api/projects (Admin, PM)
Request:
{
  "name": "Project Alpha",
  "clientId": "client-id",
  "status": "Draft"
}

### GET /api/projects (All logged-in roles)
Response:
{ "data": [ ...projects ] }

### PATCH /api/projects/:id (Admin, PM)
Request:
{
  "name": "New name",
  "status": "Active"
}
