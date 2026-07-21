import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate } from "k6/metrics";

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 409));

const BASE_URL = __ENV.BASE_URL || "http://127.0.0.1:5001";
const PROFILE = __ENV.STRESS_PROFILE || "smoke";
const PASSWORD = __ENV.STRESS_TEST_PASSWORD || "StressTest123!";
const profiles = {
  smoke: { vus: 2, duration: "30s" },
  users10: { vus: 10, duration: "1m" },
  users25: { vus: 25, duration: "2m" },
  users50: { vus: 50, duration: "2m" },
  users100: { vus: 100, duration: "2m" },
  recovery: { vus: 10, duration: "1m" },
};
const selected = profiles[PROFILE];
if (!selected) throw new Error(`Unknown STRESS_PROFILE: ${PROFILE}`);

export const options = {
  vus: selected.vus,
  duration: selected.duration,
  thresholds: {
    unexpected_failures: ["rate<0.01"],
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
  },
};

const unexpectedFailures = new Rate("unexpected_failures");
const expectedConflicts = new Counter("expected_conflicts");
let session;

function request(method, path, body, expectedStatuses = [200]) {
  const params = {
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
      ...(method === "GET" ? {} : { "x-csrf-token": session.csrfToken }),
    },
    tags: { endpoint: path.split("?")[0] },
  };
  const response = http.request(method, `${BASE_URL}${path}`, body ? JSON.stringify(body) : null, params);
  const expected = expectedStatuses.includes(response.status);
  if (response.status === 409) expectedConflicts.add(1);
  unexpectedFailures.add(!expected);
  check(response, { [`${method} ${path} returned expected status`]: () => expected });
  return response;
}

function authenticate() {
  const userIndex = 1 + ((__VU - 1) % 7);
  const email = `stress.user.${String(userIndex).padStart(2, "0")}@gimsoi.test`;
  const login = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({ email, password: PASSWORD }), {
    headers: { "Content-Type": "application/json" },
    tags: { endpoint: "/api/auth/login" },
  });
  if (login.status !== 200) throw new Error(`Stress login failed with ${login.status}`);
  const token = login.json("token");
  const csrf = http.get(`${BASE_URL}/api/auth/csrf-token`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: { endpoint: "/api/auth/csrf-token" },
  });
  if (csrf.status !== 200 || !csrf.json("csrfToken")) throw new Error("CSRF setup failed");
  return { token, csrfToken: csrf.json("csrfToken") };
}

export function setup() {
  const login = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: "stress.user.01@gimsoi.test",
    password: PASSWORD,
  }), { headers: { "Content-Type": "application/json" } });
  check(login, { "seeded stress account is available": (response) => response.status === 200 });
  const token = login.json("token");
  const projectsResponse = http.get(`${BASE_URL}/api/projects?limit=100`, { headers: { Authorization: `Bearer ${token}` } });
  const projects = projectsResponse.json("data") || [];
  const activeProjects = projects.filter((project) => project.status === "ACTIVE");
  if (!activeProjects.length) throw new Error("No active stress projects available");
  return { projects: activeProjects.map((project) => ({ id: project.id, sprints: project.sprints || [] })) };
}

function projectFor(data) {
  return data.projects[(__VU + __ITER) % data.projects.length];
}

export default function (data) {
  if (!session) session = authenticate();
  const project = projectFor(data);
  const roll = Math.random() * 100;

  if (roll < 45) {
    const variant = __ITER % 3;
    if (variant === 0) request("GET", `/api/projects/${project.id}`, null, [200]);
    else if (variant === 1) request("GET", `/api/tasks?projectId=${project.id}&limit=50`, null, [200]);
    else request("GET", `/api/projects/${project.id}/progress`, null, [200]);
  } else if (roll < 65) {
    if (__ITER % 2 === 0) request("GET", "/api/search?q=Stress", null, [200]);
    else request("GET", `/api/analytics/ai-context?projectId=${project.id}&limit=10`, null, [200]);
  } else if (roll < 80) {
    const sprintId = project.sprints.find((sprint) => sprint.status === "ACTIVE")?.id;
    request("POST", "/api/tasks", {
      title: `Load task vu-${__VU}-${__ITER}`,
      description: "Created by the controlled k6 stress test",
      projectId: project.id,
      sprintId,
      priority: ["LOW", "MEDIUM", "HIGH", "URGENT"][__ITER % 4],
      storyPoints: (__ITER % 8) + 1,
    }, [201]);
  } else {
    const tasksResponse = request("GET", `/api/tasks?projectId=${project.id}&limit=50`, null, [200]);
    const tasks = tasksResponse.json("data") || [];
    const task = tasks[(__VU + __ITER) % Math.max(tasks.length, 1)];
    if (!task) {
      unexpectedFailures.add(true);
    } else if (roll < 90) {
      request("PATCH", `/api/tasks/${task.id}`, {
        priority: ["LOW", "MEDIUM", "HIGH", "URGENT"][(__ITER + 1) % 4],
        version: task.version,
      }, [200, 409]);
    } else if (roll < 95) {
      request("POST", `/api/tasks/${task.id}/comments`, { content: `Load comment vu-${__VU}-${__ITER}` }, [201]);
    } else if (__ITER % 2 === 0) {
      request("GET", `/api/phases?projectId=${project.id}&limit=100`, null, [200]);
    } else {
      request("GET", `/api/sprints?projectId=${project.id}&limit=100`, null, [200]);
    }
  }

  sleep(0.2 + Math.random() * 0.8);
}

function metricValue(data, name, field) {
  return data.metrics[name]?.values?.[field] ?? 0;
}

export function handleSummary(data) {
  const profile = __ENV.STRESS_PROFILE || "unknown";
  const markdown = [
    `# k6 stress summary: ${profile}`,
    "",
    `- Requests: ${metricValue(data, "http_reqs", "count")}`,
    `- Request rate: ${metricValue(data, "http_reqs", "rate").toFixed(2)}/s`,
    `- Unexpected failure rate: ${(metricValue(data, "unexpected_failures", "rate") * 100).toFixed(2)}%`,
    `- Expected conflicts: ${metricValue(data, "expected_conflicts", "count")}`,
    `- p95 latency: ${metricValue(data, "http_req_duration", "p(95)").toFixed(2)} ms`,
    `- p99 latency: ${metricValue(data, "http_req_duration", "p(99)").toFixed(2)} ms`,
    "",
  ].join("\n");
  return {
    stdout: markdown,
    [`stress-artifacts/k6-${profile}.json`]: JSON.stringify(data, null, 2),
    [`stress-artifacts/k6-${profile}.md`]: markdown,
  };
}
