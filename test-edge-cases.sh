#!/bin/bash
export HOST="http://localhost:5001"

echo "1. Login ADMIN"
ADMIN_LOGIN=$(curl.exe -s -c admin_cookies.txt -X POST "$HOST/api/auth/login" -H "Content-Type: application/json" -d '{"email":"pm@gimsoi.com", "password":"Password123!"}')
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

ADMIN_CSRF_RESP=$(curl.exe -s -b admin_cookies.txt -c admin_cookies.txt -X GET "$HOST/api/auth/csrf-token" -H "Authorization: Bearer $ADMIN_TOKEN")
ADMIN_CSRF=$(echo "$ADMIN_CSRF_RESP" | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)

echo "2. Login ATTACKER"
ATTACKER_LOGIN=$(curl.exe -s -c attacker_cookies.txt -X POST "$HOST/api/auth/login" -H "Content-Type: application/json" -d '{"email":"intern@gimsoi.com", "password":"Password123!"}')
ATTACKER_TOKEN=$(echo "$ATTACKER_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

ATTACKER_CSRF_RESP=$(curl.exe -s -b attacker_cookies.txt -c attacker_cookies.txt -X GET "$HOST/api/auth/csrf-token" -H "Authorization: Bearer $ATTACKER_TOKEN")
ATTACKER_CSRF=$(echo "$ATTACKER_CSRF_RESP" | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)

echo "Setting up data..."
CLIENT_OUTPUT=$(curl.exe -s -b admin_cookies.txt -X POST "$HOST/api/clients" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -H "x-csrf-token: $ADMIN_CSRF" -d '{"name": "QA Client Edge", "contactEmail": "qa_edge@test.com"}')
CLIENT_ID=$(echo "$CLIENT_OUTPUT" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

PROJECT_OUTPUT=$(curl.exe -s -b admin_cookies.txt -X POST "$HOST/api/projects" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -H "x-csrf-token: $ADMIN_CSRF" -d "{\"name\": \"QA Project Edge\", \"clientId\": \"$CLIENT_ID\"}")
PROJECT_ID=$(echo "$PROJECT_OUTPUT" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

PHASE_OUTPUT=$(curl.exe -s -b admin_cookies.txt -X POST "$HOST/api/phases" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -H "x-csrf-token: $ADMIN_CSRF" -d "{\"name\": \"QA Phase Edge\", \"projectId\": \"$PROJECT_ID\"}")
PHASE_ID=$(echo "$PHASE_OUTPUT" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

TASK_OUTPUT=$(curl.exe -s -b admin_cookies.txt -X POST "$HOST/api/tasks" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -H "x-csrf-token: $ADMIN_CSRF" -d "{\"title\": \"Phase Task Edge\", \"projectId\": \"$PROJECT_ID\", \"phaseId\": \"$PHASE_ID\"}")
TASK_ID=$(echo "$TASK_OUTPUT" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
TASK_VERSION=$(echo "$TASK_OUTPUT" | grep -o '"version":[0-9]*' | head -n 1 | cut -d':' -f2 | tr -d '}')

COMMENT_OUTPUT=$(curl.exe -s -b admin_cookies.txt -X POST "$HOST/api/tasks/$TASK_ID/comments" -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -H "x-csrf-token: $ADMIN_CSRF" -d "{\"content\": \"My Comment\"}")
COMMENT_ID=$(echo "$COMMENT_OUTPUT" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

echo "--- RUNNING TESTS ---"

echo "Test 1: Negative Boundary Values for Health Score"
curl.exe -s -i -b admin_cookies.txt -X POST "$HOST/api/analytics/health-score" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "x-csrf-token: $ADMIN_CSRF" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\": \"$PROJECT_ID\", \"completionRate\": -10, \"blockedTasks\": \"five\"}"

echo -e "\n\nTest 2: Massive Payload Injection"
PAYLOAD=$(head -c 1000000 < /dev/zero | tr '\0' 'A')
echo "{\"data\": \"$PAYLOAD\"}" > payload.json
curl.exe -s -i -b admin_cookies.txt -X POST "$HOST/api/analytics/metrics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "x-csrf-token: $ADMIN_CSRF" \
  -H "Content-Type: application/json" \
  -d @payload.json
rm payload.json

echo -e "\n\nTest 3: IDOR - Unauthorized Comment Deletion"
curl.exe -s -i -b attacker_cookies.txt -X DELETE "$HOST/api/comments/$COMMENT_ID" \
  -H "Authorization: Bearer $ATTACKER_TOKEN" \
  -H "x-csrf-token: $ATTACKER_CSRF"

echo -e "\n\nTest 4: Privilege Escalation - Elevating Role to Admin"
curl.exe -s -i -b attacker_cookies.txt -X PATCH "$HOST/api/projects/$PROJECT_ID/members/dummy-user-id" \
  -H "Authorization: Bearer $ATTACKER_TOKEN" \
  -H "x-csrf-token: $ATTACKER_CSRF" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'

echo -e "\n\nTest 5: Cross-Project Leakage - Attaching Comment to Mismatched Project"
curl.exe -s -i -b admin_cookies.txt -X POST "$HOST/api/tasks/$TASK_ID/comments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "x-csrf-token: $ADMIN_CSRF" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\": \"wrong-project-xyz\", \"content\": \"Leaked comment test\"}"

echo -e "\n\nTest 6: Activity Logging - Race Condition on State Transitions"
curl.exe -s -i -b admin_cookies.txt -X PATCH "$HOST/api/tasks/$TASK_ID" -H "Authorization: Bearer $ADMIN_TOKEN" -H "x-csrf-token: $ADMIN_CSRF" -H "Content-Type: application/json" -d "{\"status\": \"DONE\", \"version\": $TASK_VERSION}" & \
curl.exe -s -i -b admin_cookies.txt -X PATCH "$HOST/api/tasks/$TASK_ID" -H "Authorization: Bearer $ADMIN_TOKEN" -H "x-csrf-token: $ADMIN_CSRF" -H "Content-Type: application/json" -d "{\"status\": \"IN_PROGRESS\", \"version\": $TASK_VERSION}" & \
curl.exe -s -i -b admin_cookies.txt -X PATCH "$HOST/api/tasks/$TASK_ID" -H "Authorization: Bearer $ADMIN_TOKEN" -H "x-csrf-token: $ADMIN_CSRF" -H "Content-Type: application/json" -d "{\"status\": \"TODO\", \"version\": $TASK_VERSION}" & wait

echo -e "\n\nTest 7: Data Constraints - Label Exceeding Length Limits"
LONG_LABEL=$(head -c 600 < /dev/zero | tr '\0' 'A')
curl.exe -s -i -b admin_cookies.txt -X POST "$HOST/api/labels" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "x-csrf-token: $ADMIN_CSRF" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$LONG_LABEL\", \"color\": \"#FF0000\"}"

echo -e "\n\nTest 8: SQL/NoSQL Injection in Label Queries"
curl.exe -s -i -b admin_cookies.txt -G "$HOST/api/tasks" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "x-csrf-token: $ADMIN_CSRF" \
  --data-urlencode 'labels[$ne]=null' \
  --data-urlencode "labels=' OR 1=1--"

echo -e "\n\nTesting Completed."
