#!/bin/bash
# test.sh
# Extract and run the curl commands from qa_defect_fixes.md Phase Linkage section

# 1. Login
echo "1. Logging in..."
LOGIN_OUTPUT=$(curl -s -c cookie.txt -b cookie.txt -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pm@gimsoi.com", "password":"Password123!"}')
echo "$LOGIN_OUTPUT"
JWT_TOKEN=$(echo "$LOGIN_OUTPUT" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Get CSRF Token
echo "2. Fetching CSRF..."
CSRF_OUTPUT=$(curl -s -c cookie.txt -b cookie.txt -X GET http://localhost:5001/api/auth/csrf-token \
  -H "Authorization: Bearer $JWT_TOKEN")
echo "$CSRF_OUTPUT"
CSRF_TOKEN=$(echo "$CSRF_OUTPUT" | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)

# 3. Create Phase (Needs a valid project ID, so we create a Client and Project first)
echo "3. Creating Client..."
CLIENT_OUTPUT=$(curl -s -b cookie.txt -X POST http://localhost:5001/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d '{"name": "QA Client", "contactEmail": "qa_client@test.com"}')
echo "$CLIENT_OUTPUT"
CLIENT_ID=$(echo "$CLIENT_OUTPUT" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

echo "4. Creating Project..."
PROJECT_OUTPUT=$(curl -s -b cookie.txt -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d "{\"name\": \"QA Project\", \"clientId\": \"$CLIENT_ID\"}")
echo "$PROJECT_OUTPUT"
PROJECT_ID=$(echo "$PROJECT_OUTPUT" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

# Now the actual Phase Linkage commands
echo "5. Creating Phase..."
PHASE_OUTPUT=$(curl -s -b cookie.txt -X POST http://localhost:5001/api/phases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d "{\"name\": \"QA Phase\", \"projectId\": \"$PROJECT_ID\"}")
echo "$PHASE_OUTPUT"
PHASE_ID=$(echo "$PHASE_OUTPUT" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

echo "6. Creating Task Linked to Phase..."
curl -s -b cookie.txt -X POST http://localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d "{\"title\": \"Phase Task\", \"projectId\": \"$PROJECT_ID\", \"phaseId\": \"$PHASE_ID\"}"
