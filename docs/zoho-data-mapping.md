# Zoho to Backend Mapping

Zoho Project ID -> externalProjectId  
Zoho Project Name -> name  
Zoho Owner -> owner  
Zoho Status -> status  
Zoho % Complete -> percentComplete  
Zoho Open Tasks -> openTasks  
Zoho Closed Tasks -> closedTasks  
Zoho Open Issues -> openIssues  
Zoho End Date -> plannedEndDate  

## Example Input Payload

```json
{
  "id": "12345",
  "name": "Project Tracker",
  "owner": "Backend Team",
  "status": "active",
  "percentComplete": 65,
  "openTasks": 5,
  "closedTasks": 10,
  "openIssues": 2,
  "endDate": "2026-06-30"
}

Project Health is calculated using:
- project completion percentage
- task completion rate
- whether the project is past its planned end date