// Compiles plain (non-JSX) .ts modules under lib/ to CommonJS in a temp
// directory so validate:* scripts can `require()` real pure-logic modules
// without adding a test runner or transpile-on-import loader. Generalizes
// the single-file transpile validate-discord-cta.mjs uses to a multi-file
// dependency graph — pass every entry module you need plus whatever it
// imports locally (tsc resolves and emits the whole graph in one pass).
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const nodeRequire = createRequire(import.meta.url);

export function compileForRequire(entryRelPaths) {
  const outDir = mkdtempSync(path.join(os.tmpdir(), "lexicon-ts-"));
  const tscBin = path.join(REPO_ROOT, "node_modules", "typescript", "bin", "tsc");
  const args = [
    tscBin,
    "--module", "commonjs",
    "--moduleResolution", "node",
    "--target", "ES2021",
    "--lib", "ES2021",
    "--esModuleInterop",
    "--skipLibCheck",
    "--rootDir", ".",
    "--outDir", outDir,
    ...entryRelPaths,
  ];
  try {
    execFileSync(process.execPath, args, { cwd: REPO_ROOT, stdio: "pipe" });
  } catch (error) {
    // tsc exits non-zero on any type error anywhere in the compiled
    // program, including unrelated ambient .d.ts noise (see
    // docs/universe-realm-game-audit.md's tsc note) — emission still
    // succeeds in that case. Only surface this if the modules we actually
    // need failed to appear (checked by the require() calls below).
  }

  const modules = entryRelPaths.map((relPath) => {
    const outPath = path.join(outDir, relPath.replace(/\.tsx?$/, ".js"));
    try {
      return nodeRequire(outPath);
    } catch (requireError) {
      throw new Error(
        `Failed to require compiled ${relPath} (${outPath}): ${requireError.message}`
      );
    }
  });

  process.on("exit", () => rmSync(outDir, { recursive: true, force: true }));
  return modules;
}
