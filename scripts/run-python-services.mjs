import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const [mode] = process.argv.slice(2);

const supportedModes = new Set(["package", "test", "typecheck"]);

if (!supportedModes.has(mode)) {
  console.error(
    "Usage: node scripts/run-python-services.mjs <package|test|typecheck>",
  );
  process.exit(1);
}

const servicesRoot = path.join(process.cwd(), "services");
const services = readdirSync(servicesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({
    name: entry.name,
    dir: path.join("services", entry.name),
  }))
  .filter(
    (service) =>
      existsSync(path.join(process.cwd(), service.dir, "pyproject.toml")) &&
      existsSync(path.join(process.cwd(), service.dir, "src")),
  )
  .sort((left, right) => left.name.localeCompare(right.name));

if (services.length === 0) {
  console.error("No Python service workspaces were discovered under services/.");
  process.exit(1);
}

for (const service of services) {
  console.log(`==> ${mode} ${service.name}`);

  let command;
  let args;

  switch (mode) {
    case "package":
      command = "make";
      args = ["package", `SERVICE=${service.dir}`];
      break;
    case "test":
      command = process.execPath;
      args = ["scripts/run-python-service-test.mjs", service.dir, service.name];
      break;
    case "typecheck":
      command = process.execPath;
      args = ["scripts/run-uv.mjs", "run", "--directory", service.dir, "mypy", "src"];
      break;
    default:
      console.error(`Unsupported mode: ${mode}`);
      process.exit(1);
  }

  const result = spawnSync(command, args, {
    env: process.env,
    shell: false,
    stdio: "inherit",
  });

  if (typeof result.status !== "number" || result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
