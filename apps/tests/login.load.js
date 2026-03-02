import axios from "axios";

const URL = "http://localhost:5001/api/auth/login";

async function runLoad(concurrency) {
  const start = Date.now();

  const requests = Array.from({ length: concurrency }, () =>
    axios.post(URL, {
      email: "fake@test.com",
      password: "WrongPass"
    }).catch(err => err.response)
  );

  const results = await Promise.all(requests);

  const end = Date.now();
  const totalTime = end - start;

  const errors = results.filter(r => r.status >= 500).length;

  console.log(`\nConcurrency: ${concurrency}`);
  console.log(`Avg Response Time: ${totalTime / concurrency} ms`);
  console.log(`Slowest Request: ${Math.max(...results.map(r => r.headers['x-response-time'] || 0))}`);
  console.log(`Error Rate: ${(errors / concurrency) * 100}%`);
}

(async () => {
  await runLoad(10);
  await runLoad(50);
  await runLoad(100);
})();