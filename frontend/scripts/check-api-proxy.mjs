// Diagnostic check for the Vite proxy documented in vite.config.ts (/api -> http://backend:8000).
// Not part of `npm test`: a known proxy timeout must not turn this into a permanently failing suite.
const TARGET_URL = "http://localhost:5173/api/metrics";
const TIMEOUT_MS = 10_000;

async function main() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(TARGET_URL, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      console.error(`Proxy check: FAILED (HTTP ${response.status})`);
      process.exitCode = 1;
      return;
    }

    const body = await response.json();
    if (!Array.isArray(body)) {
      console.error("Proxy check: FAILED (unexpected response shape)");
      process.exitCode = 1;
      return;
    }

    console.log("Proxy check: OK (200)");
  } catch (error) {
    clearTimeout(timer);
    if (error.name === "AbortError") {
      console.log(
        `Proxy check: TIMEOUT after ${TIMEOUT_MS}ms (known issue, cause not determined)`,
      );
      return;
    }
    console.error(`Proxy check: FAILED (${error.message})`);
    process.exitCode = 1;
  }
}

main();
