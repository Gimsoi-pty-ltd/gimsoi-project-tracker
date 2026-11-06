# Employee Recommendations API

**Project:** GIMSOI Project Tracker  
**Sprint:** Sprint 2  
**Component:** Backend – Employee Recommendation API  
**Status:** Implemented; manual testing completed; automated testing pending safe database verification

## 1. Purpose

The Employee Recommendations API helps project managers identify suitable employees for task allocation based on their current workloads.

The service evaluates eligible project members and returns a ranked list to support workload balancing and project management decisions.

## 2. API Endpoint

**Method:** GET

**Route:**
`/api/projects/:id/employee-recommendations`

**Example:**
`GET /api/projects/0e1a6261-5d42-4059-a244-2c3b22b5465a/employee-recommendations?limit=5`

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | String | Project identifier |
| `limit` | Integer | Maximum number of recommendations; defaults to 5 and is constrained to 1–20 |

## 3. Authentication and Authorization

The endpoint requires a valid authenticated session or bearer token.

Access is restricted to:

- **ADMIN:** Can retrieve recommendations for any accessible project.
- **PM:** Can retrieve recommendations for projects they created.

CLIENT and INTERN users are not permitted to access the endpoint.

## 4. Backend Implementation

The endpoint is implemented using the following components:

- `routes/project.route.js` — Registers the protected API route.
- `controllers/employeeRecommendation.controller.js` — Processes the request and returns the response.
- `services/employeeRecommendation.service.js` — Generates and ranks recommendations.
- `services/employeeCapacity.service.js` — Calculates employee workload information.
- `middleware/verify-token.middleware.js` — Verifies authentication.
- `middleware/auth.middleware.js` — Enforces role-based access control.

## 5. Recommendation Logic

The service retrieves eligible employees associated with the requested project.

It evaluates workload information including:

- Active task count
- Active story points
- Completed task count
- Overdue task count
- Blocked task count

Employees are ranked by ascending active story points, followed by ascending active task count.

The API returns a reason explaining each recommendation.

This is workload-based ranking; it does not currently establish skill matching or AI model-generated predictions.

## 6. Response Contract

A successful response contains:

- `success`: Boolean indicating request success.
- `message`: Human-readable result message.
- `data`: Array of employee recommendations.

Each recommendation includes:

- `rank`
- `employee`
- `workload`
- `reason`

The frontend should use the returned fields to display employee rankings, workload indicators and explanations.

The exact nested `employee` and `workload` property names should be taken from the service implementation or an actual API response before final frontend integration.

## 7. Error Handling

| HTTP status | Scenario |
|---|---|
| 200 | Recommendations retrieved successfully |
| 401 | Authentication required or invalid |
| 403 | User lacks the required permissions |
| 404 | Requested project does not exist |

## 8. Testing

### Manual tests completed

- ADMIN authentication and endpoint access.
- Successful retrieval of ranked recommendations.
- Limit parameter tests using 1, 2 and 5.
- Stable ordering of returned recommendations.
- Invalid project identifier returning HTTP 404.
- Unauthenticated request returning HTTP 401.

### Automated tests available

Playwright tests exist in:

`tests/api/employee-recommendations.spec.js`

They cover ADMIN access, project-owning PM access, CLIENT restrictions, INTERN restrictions and PM project ownership restrictions.

**Execution status:** Pending.

The automated test setup truncates database tables. Tests must only be executed after confirming that the test database is isolated from development and production environments.

## 9. Frontend Integration

The frontend should send an authenticated GET request to the endpoint using the selected project ID.

The response can be displayed using a recommendation list or card component.

The sidebar currently contains an AI Recommendations navigation link pointing to `/recommendations`. A corresponding frontend page or route has not yet been identified.

Frontend implementation should be coordinated with the responsible frontend team.

## 10. Outstanding Work

- Confirm dedicated test database isolation.
- Execute and review automated API tests safely.
- Confirm final nested response fields with the frontend team.
- Integrate recommendations into the agreed frontend page.
- Submit the backend implementation and documentation for code review.

## 11. Conclusion

The Employee Recommendations API provides a functioning backend mechanism for recommending project employees based on workload.

Manual API verification has succeeded. Automated testing and frontend integration remain pending, with database safety verification required before executing the existing Playwright suite.