// Runs every validate:* script in sequence and prints a pass/fail summary.
// Convenience wrapper — CI or a human can still run individual
// `npm run validate:<name>` scripts directly.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const scriptNames = Object.keys(pkg.scripts)
  .filter((name) => name.startsWith("validate:") && name !== "validate:all")
  .sort();

let failed = 0;
for (const name of scriptNames) {
  process.stdout.write(`\n> npm run ${name}\n`);
  try {
    execFileSync("npm", ["run", "--silent", name], { stdio: "inherit" });
  } catch {
    failed += 1;
    console.error(`✗ ${name} failed`);
  }
}

console.log(`\n${scriptNames.length - failed}/${scriptNames.length} validate scripts passed.`);
if (failed > 0) process.exit(1);
