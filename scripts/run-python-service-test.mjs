import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const [serviceDir, explicitServiceName] = process.argv.slice(2);

if (!serviceDir) {
  console.error(
    "Usage: node scripts/run-python-service-test.mjs <service-dir> [service-name]",
  );
  process.exit(1);
}

const serviceName = explicitServiceName ?? path.basename(serviceDir);

const result = spawnSync(
  process.execPath,
  [
    "scripts/run-uv.mjs",
    "run",
    "--directory",
    serviceDir,
    "pytest",
    "tests",
    "-v",
  ],
  {
    env: {
      ...process.env,
      CORS_ALLOW_ORIGIN: process.env.CORS_ALLOW_ORIGIN ?? "*",
      ENVIRONMENT: process.env.ENVIRONMENT ?? "local",
      POWERTOOLS_METRICS_DISABLED:
        process.env.POWERTOOLS_METRICS_DISABLED ?? "true",
      POWERTOOLS_SERVICE_NAME:
        process.env.POWERTOOLS_SERVICE_NAME ?? `${serviceName}-local`,
      POWERTOOLS_TRACE_DISABLED:
        process.env.POWERTOOLS_TRACE_DISABLED ?? "true",
      SERVICE_VERSION: process.env.SERVICE_VERSION ?? "0.0.0-local",
    },
    shell: false,
    stdio: "inherit",
  },
);

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
