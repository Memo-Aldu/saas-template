import { accessSync, constants } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const candidatePaths = [
  path.join(process.cwd(), ".venv", "Scripts", "uv.exe"),
  path.join(process.cwd(), ".venv", "bin", "uv"),
  "uv",
];

function canExecute(filePath) {
  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

const uvExecutable =
  candidatePaths.find((candidate) =>
    candidate === "uv" ? true : canExecute(candidate),
  ) ?? "uv";

const result = spawnSync(uvExecutable, process.argv.slice(2), {
  env: process.env,
  shell: false,
  stdio: "inherit",
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
